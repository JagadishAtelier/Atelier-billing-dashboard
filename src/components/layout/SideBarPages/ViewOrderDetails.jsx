import React, { useEffect, useRef, useState } from "react";
import html2pdf from "html2pdf.js";
import logo from "../../assets/Company_logo1.png";
import orderService from "./services/orderService";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function ViewOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const componentRef = useRef();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await orderService.getById(id);
        console.log("API response:", response); // <-- debug here
        setOrder(response);
      } catch (error) {
        console.error("Failed to fetch order:", error);
      }
    };

    fetchOrder();
  }, [id]);


  const handleDownload = () => {
    if (!componentRef.current || !order) return alert("Nothing to download");

    html2pdf()
      .set({
        margin: 10,
        filename: `Purchase_Order_${order.po_no}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, logging: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(componentRef.current)
      .save();
  };

  if (!order) return <p>Loading...</p>;

  // Safely compute totals
  const computeTotals = (items = []) => {
    let subTotal = 0;
    let totalTax = 0;
    items.forEach((item) => {
      subTotal += (item.quantity || 0) * parseFloat(item.unit_price || 0);
      totalTax += parseFloat(item.tax_amount || 0);
    });
    return { subTotal, totalTax, grandTotal: subTotal + totalTax };
  };

  const { subTotal, totalTax, grandTotal } = computeTotals(order.items || []);

  return (
    <div style={{ backgroundColor: "#F7F8FC", minHeight: "100vh", padding: "40px" }}>
      {/* Download Button */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
        <button
          onClick={handleDownload}
          style={{
            backgroundColor: "#1C2244",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Download PDF
        </button>
      </div>

      {/* Purchase Order */}
      <div
        ref={componentRef}
        style={{
          backgroundColor: "#fff",
          padding: "40px",
          borderRadius: "10px",
          boxShadow: "0 0 15px rgba(0,0,0,0.1)",
        }}
      >
        {/* Header */}
        {/* Header */}
<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    backgroundColor: "#1C2244", // <-- header background color
    color: "#fff",              // text color to contrast
    padding: "20px 30px",
    borderRadius: "10px",
  }}
>
  <h1 style={{ fontSize: "32px", fontWeight: "bold", margin: 0 }}>PURCHASE ORDER</h1>
  <div style={{ textAlign: "center" }}>
    <img
      src={logo}
      alt="Company Logo"
      style={{
        width: "140px",
        height: "auto",
        margin: "0 auto",
        borderRadius: "5px",
        backgroundColor: "#fff", // optional: white background behind logo
        padding: "5px",
      }}
    />
    <p style={{ fontWeight: "600", marginTop: "5px", color: "#fff" }}>ATELIER CREATION</p>
  </div>
</div>


        {/* From - To */}
        {/* From - To */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          {/* From */}
          <div style={{ width: "45%" }}>
            <h2 style={{ fontWeight: "bold", marginBottom: "10px" }}>From</h2>
            <p><strong>Company:</strong> Atelier Creation</p>
            <p><strong>Location:</strong> Coimbatore</p>
            <p><strong>Contact:</strong> {order.created_by_name || "N/A"}</p>
            <p><strong>Email:</strong> {order.created_by_email || "N/A"}</p>
          </div>

          {/* To */}
          <div style={{ width: "30%" }}>
            <h2 style={{ fontWeight: "bold", marginBottom: "10px" }}>To</h2>
            <p><strong>Vendor:</strong> {order.vendor?.name || "N/A"}</p>
            <p><strong>Contact Person:</strong> {order.vendor?.contact_person || "N/A"}</p>
            <p><strong>Address:</strong> {order.vendor?.address || order.vendor?.location || "N/A"}</p>
            <p><strong>Phone:</strong> {order.vendor?.phone || "N/A"}</p>
            <p><strong>Email:</strong> {order.vendor?.email || "N/A"}</p>
            <p><strong>GST:</strong> {order.vendor?.gst_number || "N/A"}</p>
          </div>
        </div>


        {/* Order Info */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <p style={{ fontWeight: "600" }}>Purchase Order Number: {order.po_no || "N/A"}</p>
            <p style={{ fontWeight: "600" }}>
              Order Date: {order.order_date ? new Date(order.order_date).toLocaleDateString() : "N/A"}
            </p>
          </div>
          <div>
            <p style={{ fontWeight: "600" }}>Status: {order.status || "N/A"}</p>
          </div>
        </div>

        {/* Items Table */}
        <div style={{ overflowX: "auto", marginBottom: "20px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ backgroundColor: "#1C2244", color: "#fff" }}>
              <tr>
                <th style={{ padding: "8px", textAlign: "left", border: "1px solid #ccc" }}>Product ID</th>
                <th style={{ padding: "8px", textAlign: "left", border: "1px solid #ccc" }}>Product Name</th>
                <th style={{ padding: "8px", textAlign: "right", border: "1px solid #ccc" }}>Quantity</th>
                <th style={{ padding: "8px", textAlign: "right", border: "1px solid #ccc" }}>Unit Price</th>
                <th style={{ padding: "8px", textAlign: "right", border: "1px solid #ccc" }}>Tax</th>
                <th style={{ padding: "8px", textAlign: "right", border: "1px solid #ccc" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((item, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #ccc" }}>
                  <td style={{ padding: "8px" }}>{item.product?.product_code || "N/A"}</td>
                  <td style={{ padding: "8px" }}>{item.product?.product_name || "N/A"}</td>
                  <td style={{ padding: "8px", textAlign: "right" }}>{item.quantity || 0}</td>
                  <td style={{ padding: "8px", textAlign: "right" }}>₹{item.unit_price || 0}</td>
                  <td style={{ padding: "8px", textAlign: "right" }}>₹{item.tax_amount || 0}</td>
                  <td style={{ padding: "8px", textAlign: "right" }}>
                    ₹{(item.quantity || 0) * parseFloat(item.unit_price || 0) + parseFloat(item.tax_amount || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div style={{ width: "50%", marginLeft: "auto", marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <p style={{ fontWeight: "600" }}>Sub Total:</p>
            <p style={{ fontWeight: "600" }}>₹{subTotal}</p>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <p style={{ fontWeight: "600" }}>Total Tax:</p>
            <p style={{ fontWeight: "600" }}>₹{totalTax}</p>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              color: "#000",
              padding: "1px",
              fontWeight: "600",
              borderRadius: "5px",
            }}
          >
            <p>Grand Total:</p>
            <p>₹{grandTotal}</p>
          </div>
        </div>

        {/* Notes */}
        <div style={{ marginBottom: "40px" }}>
          <p style={{ fontWeight: "600", fontSize: "18px", marginBottom: "8px" }}>Notes:</p>
          <ul style={{ paddingLeft: "20px" }}>
            <li>Payment due within 30 days.</li>
            <li>Goods once sold will not be taken back.</li>
            <li>Delivery expected within 7 days.</li>
          </ul>
        </div>

        {/* Signature */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "80px" }}>
          <div>
            <p>Manager Signature</p>
          </div>
          <div>
            <p>Client Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewOrderDetails;
