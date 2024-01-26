import mongoose from 'mongoose';

const { Schema } = mongoose;

const gameSchema = Schema({
  _id: Schema.Types.ObjectId,
  room: { type: Schema.Types.ObjectId, ref: 'Room' },
  total_rounds: { type: Number, default: 3 },
  round: { type: Number, default: 1 },
  phase: { type: Number, default: 1 },
  artistId: { type: Schema.Types.ObjectId, ref: 'User' },
  artists: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  scores: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  words: [{ type: Schema.Types.ObjectId, ref: 'Word' }],
});

export default mongoose.model('Game', gameSchema);
