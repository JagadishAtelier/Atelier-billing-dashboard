import React from "react";
import { Card, Avatar, Typography } from "antd";

const { Text } = Typography;

const styles = {
    roundedCard: { borderRadius: 14, boxShadow: "0 6px 18px rgba(15,23,42,0.06)" },
};

const TopProducts = ({ products }) => {
    return (
        <Card size="small" style={{ ...styles.roundedCard }}>
            <div style={{ padding: 12 }}>
                <div className="text-lg font-semibold text-gray-900">Top selling products</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {products.map((p) => (
                        <div key={p.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 6px", textAlign:"center", minHeight: 120, boxSizing: "border-box", background: "#fff", borderRadius: 8 }}>
                            <Avatar shape="square" size={56} style={{ background: "#f3f4f6", color: "#374151", marginBottom: 8 }}>{p.name.charAt(0)}</Avatar>
                            <a className="text-blue-600 font-semibold text-sm" style={{ textDecoration: "none", marginTop: 6}}>{p.name}</a>
                            <div className="text-gray-900 font-medium">{p.price}</div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
};

export default TopProducts;