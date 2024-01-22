import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = Schema({
  _id: Schema.Types.ObjectId,
  room: { type: Schema.Types.ObjectId, ref: 'Room' },
  name: { type: String, required: true },
  game: { type: Schema.Types.ObjectId, ref: 'Game' },
  color: { type: String, required: true },
});

export default mongoose.model('User', userSchema);
