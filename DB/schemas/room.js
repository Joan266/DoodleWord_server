import mongoose from 'mongoose';

const { Schema } = mongoose;

const roomSchema = Schema({
  _id: Schema.Types.ObjectId,
  game: { type: Schema.Types.ObjectId, ref: 'Game' },
  code: {
    type: String,
    required: true,
    unique: true,
    unmutable: true,
  },
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

export default mongoose.model('Room', roomSchema);
