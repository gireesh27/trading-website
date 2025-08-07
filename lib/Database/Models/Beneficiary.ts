import mongoose from "mongoose";

const BeneficiarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    beneficiary_id: {
      type: String,
      required: true,
      unique: true,
    },

    // Required bank details
    bank_account_number: {
      type: String,
      required: true,
      minlength: 8,
      maxlength: 20,
    },
    bank_ifsc: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 15,
    },

    // Required personal details
    beneficiary_name: {
      type: String,
      required: true,
      trim: true,
    },
    beneficiary_email: {
      type: String,
      required: true,
      match: /^\S+@\S+\.\S+$/,
    },
    beneficiary_phone: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 15,
    },

    // Optional UPI / card / virtual payment fields
    vpa: { type: String },
    card_token: { type: String },
    card_network_type: { type: String },

    // Optional address fields
    beneficiary_address: { type: String },
    beneficiary_city: { type: String },
    beneficiary_state: { type: String },
    beneficiary_postal_code: { type: String },
    beneficiary_country_code: {
      type: String,
      default: "+91",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Beneficiary ||
  mongoose.model("Beneficiary", BeneficiarySchema);
