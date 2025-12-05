// src/components/dashboard/LatestPayments.jsx
import React, { useMemo } from "react";
import { Search, Plus, Minus } from "lucide-react";
import StatusTag from "./StatusTag";

/**
 * Props expected:
 * - payments: Array of payment objects { id, customer, fulfillment, status, total, date, method, notes }
 * - filterKey, setFilterKey
 * - searchQ, setSearchQ
 * - expandedRowKeys, setExpandedRowKeys    (array of row keys, string[])
 *
 * This component mirrors the visual style & typography of PurchaseManagement.
 */

const LatestPayments = ({
  payments = [],
  filterKey,
  setFilterKey,
  searchQ,
  setSearchQ,
  expandedRowKeys,
  setExpandedRowKeys,
}) => {
  const styles = {
    roundedCard: { borderRadius: 14, boxShadow: "0 6px 18px rgba(15,23,42,0.06)" },
  };

  // -------------------------------
  // FILTER & SEARCH
  // -------------------------------
  const filteredPayments = useMemo(() => {
    const q = (searchQ || "").trim().toLowerCase();

    return (payments || []).filter((p) => {
      if (filterKey && filterKey !== "All") {
        if (filterKey === "Open" && p.fulfillment === "Draft") return true;
        if (filterKey === "Completed" && p.fulfillment === "Fulfilled") return true;
        if (filterKey === "Fulfilled" && p.fulfillment === "Fulfilled") return true;
      }

      if (!q) return true;

      return (
        (p.id || "").toLowerCase().includes(q) ||
        (p.customer || "").toLowerCase().includes(q)
      );
    });
  }, [payments, filterKey, searchQ]);

  // -------------------------------
  // Helpers
  // -------------------------------
  const makeRowKey = (r, i) => `${r.id || "p"}-${i}`;

  const handleToggleExpand = (rowKey) => {
    setExpandedRowKeys((prev = []) =>
      prev.includes(rowKey) ? prev.filter((k) => k !== rowKey) : [...prev, rowKey]
    );
  };

  const formatCurrency = (v) =>
    typeof v === "number" ? `₹${v.toLocaleString("en-IN")}` : v;

  // -------------------------------
  // Render
  // -------------------------------
  return (
    <div className="space-y-4 p-8 bg-white" style={{ ...styles.roundedCard }}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Latest Payments</h2>
          <p className="text-gray-500 mt-1">Recent payments and their statuses</p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Search payment or customer"
              className="pl-10 pr-3 py-2 border rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      

      {/* Table Card */}
      <div className="bg-white rounded-xl">
        <div className="overflow-x-auto">
          {filteredPayments.length === 0 ? (
            <div className="p-8 flex items-center justify-center">
              <div className="text-gray-500">No payments found</div>
            </div>
          ) : (
            <table className="w-full table-fixed">
              <thead className="bg-gray-50 ">
                <tr>
                  <th className="w-[44px] px-4 py-3 text-left text-gray-500"></th>
                  <th className="px-6 py-3 text-left text-gray-500">Payment ID</th>
                  <th className="px-6 py-3 text-left text-gray-500">Customer</th>
                  <th className="px-6 py-3 text-left text-gray-500">Fulfillment</th>
                  <th className="px-6 py-3 text-right text-gray-500">Total</th>
                  <th className="px-6 py-3 text-left text-gray-500">Date</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredPayments.map((p, idx) => {
                  const rowKey = makeRowKey(p, idx);
                  const expanded = (expandedRowKeys || []).includes(rowKey);

                  // fulfillment pill styles
                  const fulfillmentBg =
                    p.fulfillment === "Fulfilled"
                      ? "bg-emerald-50 text-emerald-700"
                      : p.fulfillment === "Cancelled"
                      ? "bg-rose-50 text-rose-700"
                      : "bg-gray-100 text-gray-700";

                  return (
                    <React.Fragment key={rowKey}>
                      <tr
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleToggleExpand(rowKey)}
                      >
                        <td className="px-4 py-4 align-top">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleExpand(rowKey);
                            }}
                            className="w-9 h-9 rounded-md flex items-center justify-center bg-gray-50"
                            aria-label={expanded ? "Collapse" : "Expand"}
                          >
                            {expanded ? (
                              <Minus className="w-4 h-4 text-gray-600" />
                            ) : (
                              <Plus className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                        </td>

                        <td className="px-6 py-4 align-top">
                          <div className="text-blue-600 font-semibold text-sm">{p.id}</div>
                        </td>

                        <td className="px-6 py-4 align-top">
                          <div className="text-gray-900 font-medium">{p.customer}</div>
                        </td>

                        <td className="px-6 py-4 align-top">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${fulfillmentBg}`}>
                            {p.fulfillment}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right align-top">
                          <div className="text-gray-900 font-medium">{formatCurrency(p.total)}</div>
                        </td>

                        <td className="px-6 py-4 align-top">
                          <div className="text-gray-600 text-sm">{p.date}</div>
                        </td>
                      </tr>

                      {/* Expanded row */}
                      {expanded && (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 bg-gray-50">
                            <div className="rounded-md p-4 bg-white border">
                              <div className="flex flex-wrap gap-8">
                                <div>
                                  <div className="text-xs text-gray-500">Date</div>
                                  <div className="text-sm text-gray-900">{p.date}</div>
                                </div>

                                <div>
                                  <div className="text-xs text-gray-500">Payment method</div>
                                  <div className="text-sm text-gray-900">{p.method || "N/A"}</div>
                                </div>

                                <div className="min-w-[200px]">
                                  <div className="text-xs text-gray-500">Notes</div>
                                  <div className="text-sm text-gray-900">{p.notes || "-"}</div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default LatestPayments;
