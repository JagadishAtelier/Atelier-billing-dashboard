// LowStockAlerts.jsx
import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

/**
 * LowStockAlerts
 *
 * Props:
 *  - items: Array of { name, current, minimum, sku }
 *  - className: optional extra class names
 *  - onItemClick: optional callback(item) when a row is clicked
 */
const styles = {
    roundedCard: { borderRadius: 14, boxShadow: "0 6px 18px rgba(15,23,42,0.06)" },
};
export default function LowStockAlerts({ items = [], className = "", onItemClick }) {
  return (
    <Card className="lg:col-span-2 border-0 shadow-lg" >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          Low Stock Alerts
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No low-stock products 🎉</div>
          ) : (
            items.map((product, index) => {
              const key = product.sku ?? `${product.name}-${index}`;
              const handleClick = () => onItemClick && onItemClick(product);

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.06 }}
                  onClick={handleClick}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-100 hover:shadow-md transition-shadow cursor-pointer"
                  role={onItemClick ? "button" : undefined}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 font-medium truncate">{product.name}</p>
                    {product.sku && <p className="text-gray-500 text-sm truncate">SKU: {product.sku}</p>}
                  </div>

                  <div className="text-right ml-4 flex flex-col items-end">
                    <p className="text-red-600 font-semibold">
                      {product.current} / {product.minimum}
                    </p>
                    <p className="text-gray-500 text-sm">Current / Min</p>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
