import mongoose from 'mongoose';

const { Schema } = mongoose;

const wordSchema = Schema({
  _id: Schema.Types.ObjectId,
  name: { type: String, required: true },
});

export default mongoose.model('Word', wordSchema);
