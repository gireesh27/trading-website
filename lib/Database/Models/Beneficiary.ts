import mongoose from "mongoose";

const BeneficiarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Improve query speed on userId
    },
    beneficiary_id: {
      type: String,
      required: true,
      unique: true, // Cashfree ensures uniqueness
    },
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
    beneficiary_name: {
      type: String,
      required: true,
      trim: true,
    },
    beneficiary_email: {
      type: String,
      match: /^\S+@\S+\.\S+$/,
    },
    beneficiary_phone: {
      type: String,
      minlength: 10,
      maxlength: 15,
    },

    // Optional UPI / card data for future use
    vpa: { type: String },
    card_token: { type: String },
    card_network_type: { type: String },

    // Optional address data
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
