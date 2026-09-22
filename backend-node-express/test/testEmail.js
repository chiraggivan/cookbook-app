require("dotenv").config({ path: "../.env" });

const { emailVerification } = require("../src/utils/emailServiceUtils");

const testEmail = async () => {
  try {
    await emailVerification("chirag.d@gmail.com", "test-token-12345");

    console.log("Email sent successfully");
  } catch (error) {
    console.log("Error:", error.message);
  }
};

testEmail();
