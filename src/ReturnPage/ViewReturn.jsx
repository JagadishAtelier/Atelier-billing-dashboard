import React, { useEffect, useRef, useState } from "react";
import html2pdf from "html2pdf.js";
import logo from "../components/assets/Company_logo1.png";

import returnService from "./service/returnService";
import { useParams, useNavigate } from "react-router-dom";

function ViewReturn() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ret, setRet] = useState(null);
  const componentRef = useRef();

  useEffect(() => {
    const fetchReturn = async () => {
      try {
        const res = await returnService.getById(id);
        setRet(res);
      } catch (err) {
        console.error("Failed to fetch return:", err);
      }
    };
    fetchReturn();
  }, [id]);

  const handleDownload = () => {
    if (!componentRef.current || !ret) return alert("Nothing to download");

    html2pdf()
      .set({
        margin: 10,
        filename: `Return_${ret.return_no}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, logging: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(componentRef.current)
      .save();
  };

  if (!ret) return <p>Loading...</p>;

  const computeTotals = (items = []) => {
    let totalQty = 0;
    let totalAmount = 0;
    let totalTax = 0;
    items.forEach((it) => {
      totalQty += Number(it.quantity || 0);
      totalAmount += Number(it.unit_price || 0) * Number(it.quantity || 0);
      totalTax += Number(it.tax_amount || 0);
    });
    return { totalQty, totalAmount, totalTax, grandTotal: totalAmount + totalTax };
  };

  const { totalQty, totalAmount, totalTax, grandTotal } = computeTotals(ret.items || []);

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

      {/* Return Details */}
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            backgroundColor: "#1C2244",
            color: "#fff",
            padding: "20px 30px",
            borderRadius: "10px",
          }}
        >
          <h1 style={{ fontSize: "32px", fontWeight: "bold", margin: 0 }}>PRODUCT RETURN</h1>
          <div style={{ textAlign: "center" }}>
            <img
              src={logo}
              alt="Company Logo"
              style={{
                width: "140px",
                height: "auto",
                margin: "0 auto",
                borderRadius: "5px",
                backgroundColor: "#fff",
                padding: "5px",
              }}
            />
            <p style={{ fontWeight: "600", marginTop: "5px", color: "#fff" }}>ATELIER CREATION</p>
          </div>
        </div>

        {/* From - To */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          {/* From */}
          <div style={{ width: "45%" }}>
            <h2 style={{ fontWeight: "bold", marginBottom: "10px" }}>From</h2>
            <p><strong>Company:</strong> Atelier Creation</p>
            <p><strong>Contact:</strong> {ret.created_by_name || "N/A"}</p>
            <p><strong>Email:</strong> {ret.created_by_email || "N/A"}</p>
          </div>

          {/* To */}
          <div style={{ width: "30%" }}>
            <h2 style={{ fontWeight: "bold", marginBottom: "10px" }}>To</h2>
            <p><strong>Vendor:</strong> {ret.vendor?.name || "N/A"}</p>
            <p><strong>Contact Person:</strong> {ret.vendor?.contact_person || "N/A"}</p>
            <p><strong>Address:</strong> {ret.vendor?.address || ret.vendor?.location || "N/A"}</p>
            <p><strong>Phone:</strong> {ret.vendor?.phone || "N/A"}</p>
            <p><strong>Email:</strong> {ret.vendor?.email || "N/A"}</p>
            <p><strong>GST:</strong> {ret.vendor?.gst_number || "N/A"}</p>
          </div>
        </div>

        {/* Return Info */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <p style={{ fontWeight: "600" }}>Return Number: {ret.return_no || "N/A"}</p>
            <p style={{ fontWeight: "600" }}>
              Return Date: {ret.return_date ? new Date(ret.return_date).toLocaleDateString() : "N/A"}
            </p>
            <p style={{ fontWeight: "600" }}>Reason: {ret.reason || "-"}</p>
          </div>
          <div>
            <p style={{ fontWeight: "600" }}>Status: {ret.status || "N/A"}</p>
          </div>
        </div>

        {/* Items Table */}
        <div style={{ overflowX: "auto", marginBottom: "20px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ backgroundColor: "#1C2244", color: "#fff" }}>
              <tr>
                <th style={{ padding: "8px", border: "1px solid #ccc" }}>Product Code</th>
                <th style={{ padding: "8px", border: "1px solid #ccc" }}>Product Name</th>
                <th style={{ padding: "8px", border: "1px solid #ccc", textAlign: "right" }}>Quantity</th>
                <th style={{ padding: "8px", border: "1px solid #ccc", textAlign: "right" }}>Unit Price</th>
                <th style={{ padding: "8px", border: "1px solid #ccc", textAlign: "right" }}>Tax</th>
                <th style={{ padding: "8px", border: "1px solid #ccc", textAlign: "right" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {(ret.items || []).map((item, idx) => (
                <tr key={idx}>
                  <td style={{ padding: "8px" }}>{item.product?.product_code || "N/A"}</td>
                  <td style={{ padding: "8px" }}>{item.product?.product_name || "N/A"}</td>
                  <td style={{ padding: "8px", textAlign: "right" }}>{item.quantity || 0}</td>
                  <td style={{ padding: "8px", textAlign: "right" }}>₹{item.unit_price || 0}</td>
                  <td style={{ padding: "8px", textAlign: "right" }}>₹{item.tax_amount || 0}</td>
                  <td style={{ padding: "8px", textAlign: "right" }}>₹{(item.quantity || 0) * parseFloat(item.unit_price || 0) + parseFloat(item.tax_amount || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div style={{ width: "50%", marginLeft: "auto", marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <p style={{ fontWeight: "600" }}>Total Quantity:</p>
            <p style={{ fontWeight: "600" }}>{totalQty}</p>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <p style={{ fontWeight: "600" }}>Total Amount:</p>
            <p style={{ fontWeight: "600" }}>₹{totalAmount}</p>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <p style={{ fontWeight: "600" }}>Total Tax:</p>
            <p style={{ fontWeight: "600" }}>₹{totalTax}</p>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "600", fontSize: "16px" }}>
            <p>Grand Total:</p>
            <p>₹{grandTotal}</p>
          </div>
        </div>

        {/* Notes */}
        <div style={{ marginBottom: "40px" }}>
          <p style={{ fontWeight: "600", fontSize: "18px", marginBottom: "8px" }}>Notes:</p>
          <ul style={{ paddingLeft: "20px" }}>
            <li>Check returned goods for quality.</li>
            <li>Ensure proper documentation is attached.</li>
            <li>Processed according to company return policy.</li>
          </ul>
        </div>

        {/* Signature */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "80px" }}>
          <div>
            <p>Manager Signature</p>
          </div>
          <div>
            <p>Vendor Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewReturn;
