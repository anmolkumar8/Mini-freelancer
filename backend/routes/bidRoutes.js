import express from 'express';
import mongoose from 'mongoose';
import Bid from '../models/Bid.js';
import Gig from '../models/Gig.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Submit a bid
router.post('/', protect, async (req, res) => {
  try {
    const { gigId, message, price } = req.body;

    if (!gigId || !message || price === undefined) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    // Check if gig exists and is open
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    if (gig.status !== 'open') {
      return res.status(400).json({ message: 'Gig is not open for bidding' });
    }

    // Check if user already bid on this gig
    const existingBid = await Bid.findOne({ gigId, freelancerId: req.userId });
    if (existingBid) {
      return res.status(400).json({ message: 'You have already bid on this gig' });
    }

    // Check if user is the owner
    if (gig.ownerId.toString() === req.userId) {
      return res.status(400).json({ message: 'You cannot bid on your own gig' });
    }

    const bid = await Bid.create({
      gigId,
      freelancerId: req.userId,
      message,
      price
    });

    const populatedBid = await Bid.findById(bid._id)
      .populate('freelancerId', 'name email')
      .populate('gigId', 'title');

    res.status(201).json(populatedBid);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all bids for a specific gig (Owner only)
router.get('/:gigId', protect, async (req, res) => {
  try {
    const { gigId } = req.params;

    // Check if gig exists
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    // Check if user is the owner
    if (gig.ownerId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to view these bids' });
    }

    const bids = await Bid.find({ gigId })
      .populate('freelancerId', 'name email')
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Hire a freelancer (with transactional integrity - Bonus 1)
router.patch('/:bidId/hire', protect, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { bidId } = req.params;

    // Find the bid
    const bid = await Bid.findById(bidId).session(session);
    if (!bid) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Bid not found' });
    }

    // Find the gig
    const gig = await Gig.findById(bid.gigId).session(session);
    if (!gig) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Gig not found' });
    }

    // Check if user is the owner
    if (gig.ownerId.toString() !== req.userId) {
      await session.abortTransaction();
      return res.status(403).json({ message: 'Not authorized to hire for this gig' });
    }

    // Check if gig is still open (race condition protection)
    if (gig.status !== 'open') {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Gig is already assigned' });
    }

    // Check if bid is still pending
    if (bid.status !== 'pending') {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Bid is already processed' });
    }

    // Atomic update: Change gig status to assigned
    await Gig.findByIdAndUpdate(
      bid.gigId,
      { status: 'assigned' },
      { session }
    );

    // Atomic update: Mark chosen bid as hired
    await Bid.findByIdAndUpdate(
      bidId,
      { status: 'hired' },
      { session }
    );

    // Atomic update: Mark all other bids as rejected
    await Bid.updateMany(
      { gigId: bid.gigId, _id: { $ne: bidId } },
      { status: 'rejected' },
      { session }
    );

    // Commit transaction
    await session.commitTransaction();

    // Get the hired bid with populated data
    const hiredBid = await Bid.findById(bidId)
      .populate('freelancerId', 'name email')
      .populate('gigId', 'title');

    // Send real-time notification (Bonus 2)
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${bid.freelancerId.toString()}`).emit('hired', {
        message: `You have been hired for ${gig.title}!`,
        gig: {
          id: gig._id,
          title: gig.title
        },
        bid: {
          id: bid._id,
          price: bid.price
        }
      });
    }

    res.json({
      message: 'Freelancer hired successfully',
      bid: hiredBid
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

export default router;
