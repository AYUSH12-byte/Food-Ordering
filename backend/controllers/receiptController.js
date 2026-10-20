const PDFDocument = require("pdfkit");

const Receipt = require("../models/Receipt");

// GET RECEIPT

const getReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id)
      .populate("user", "name email phone")
      .populate({
        path: "order",
        populate: {
          path: "items.food",
          select: "name",
        },
      });

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: "Receipt not found",
      });
    }

    if (
      req.user.role === "customer" &&
      receipt.user._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this receipt",
      });
    }

    res.status(200).json({
      success: true,
      receipt,
    });
  } catch (error) {
    console.error("Get Receipt Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// DOWNLOAD RECEIPT PDF

const downloadReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id)
      .populate("user", "name email phone")
      .populate({
        path: "order",
        populate: {
          path: "items.food",
          select: "name",
        },
      });

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: "Receipt not found",
      });
    }

    if (
      req.user.role === "customer" &&
      receipt.user._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to download this receipt",
      });
    }

    const order = receipt.order;

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${receipt.receiptNumber}.pdf"`,
    );

    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    doc.pipe(res);

  
    // HEADER

    doc.fontSize(22).font("Helvetica-Bold").text("RESTAURANT NAME", {
      align: "center",
    });

    doc
      .fontSize(11)
      .font("Helvetica")
      .text("Online Food Ordering & Restaurant Management System", {
        align: "center",
      });

    doc.moveDown();

    doc
      .fontSize(10)
      .text("------------------------------------------------------------", {
        align: "center",
      });

    // RECEIPT DETAILS

    doc.moveDown();

    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .text(`Receipt No: ${receipt.receiptNumber}`);

    doc.font("Helvetica").text(`Order ID: ${order._id}`);

    doc.text(`Date: ${new Date(receipt.generatedAt).toLocaleString()}`);

    doc.moveDown();
-
    // CUSTOMER

    doc.font("Helvetica-Bold").text("CUSTOMER INFORMATION");

    doc
      .font("Helvetica")
      .text(`Name: ${receipt.user.name}`)
      .text(`Email: ${receipt.user.email}`)
      .text(`Phone: ${receipt.user.phone}`);

    doc.moveDown();


    // DELIVERY

    doc.font("Helvetica-Bold").text("DELIVERY INFORMATION");

    doc
      .font("Helvetica")
      .text(`Address: ${order.deliveryAddress}`)
      .text(`Phone: ${order.deliveryPhone}`);

    if (order.deliveryNote) {
      doc.text(`Note: ${order.deliveryNote}`);
    }

    doc.moveDown();

    // ORDER ITEMS

    doc.font("Helvetica-Bold").text("ORDER ITEMS");

    doc.moveDown(0.5);

    order.items.forEach((item) => {
      const itemTotal = item.price * item.quantity;

      doc
        .font("Helvetica")
        .text(`${item.name}  x${item.quantity}  Rs. ${itemTotal.toFixed(2)}`);
    });

    doc.moveDown();

    doc.text("------------------------------------------------------------", {
      align: "center",
    });


    // TOTAL


    doc.moveDown();

    doc.font("Helvetica").text(`Subtotal: Rs. ${order.subtotal.toFixed(2)}`);

    doc.text(`Delivery Charge: Rs. ${order.deliveryCharge.toFixed(2)}`);

    if (order.discountAmount > 0) {
      doc.text(
        `Coupon Discount (${order.couponCode}): - Rs. ${order.discountAmount.toFixed(2)}`,
      );
    }

    doc.moveDown(0.5);

    doc
      .fontSize(15)
      .font("Helvetica-Bold")
      .text(`TOTAL: Rs. ${order.totalAmount.toFixed(2)}`);

    doc.moveDown();

    // PAYMENT

    doc.fontSize(11).font("Helvetica-Bold").text("PAYMENT INFORMATION");

    doc
      .font("Helvetica")
      .text(`Method: ${receipt.paymentMethod}`)
      .text(`Payment Status: ${receipt.paymentStatus}`)
      .text(`Order Status: ${order.orderStatus}`);

    doc.moveDown(2);

    // FOOTER

    doc.fontSize(13).font("Helvetica-Bold").text("Thank You for Your Order!", {
      align: "center",
    });

    doc.fontSize(9).font("Helvetica").text("We appreciate your business.", {
      align: "center",
    });

    doc.end();
  } catch (error) {
    console.error("Download Receipt Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getReceipt,
  downloadReceipt,
};
