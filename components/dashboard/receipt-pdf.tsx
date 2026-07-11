import {
  Document,
  Image,
  Page,
  pdf,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { money } from "@/data/receipts";
import type { ReceiptDocData } from "./receipt-document";

/**
 * Vector receipt rendered with @react-pdf/renderer — stays crisp at any zoom
 * (unlike a rasterized html2canvas snapshot). Mirrors the on-screen layout.
 */

const C = {
  ink: "#171717",
  sub: "#6b7280",
  faint: "#9ca3af",
  line: "#e5e7eb",
  lineSoft: "#f1f1f2",
  panel: "#f4f4f5",
  white: "#ffffff",
};

const s = StyleSheet.create({
  page: {
    backgroundColor: C.white,
    color: C.ink,
    fontFamily: "Helvetica",
    fontSize: 11,
    paddingVertical: 54,
    paddingHorizontal: 44,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  logo: { height: 40, objectFit: "contain" },
  bizName: { fontFamily: "Helvetica-Bold", fontSize: 18 },
  contact: { alignItems: "flex-end", color: C.sub, fontSize: 9 },
  contactLine: { marginBottom: 2 },
  divider: { borderBottomWidth: 1, borderBottomColor: C.line, marginTop: 26 },
  label: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: C.faint,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  number: { fontFamily: "Helvetica-Bold", fontSize: 22, marginTop: 6 },
  date: { fontSize: 13, marginTop: 6 },
  card: {
    flexDirection: "row",
    backgroundColor: C.panel,
    borderRadius: 8,
    padding: 18,
    marginTop: 8,
  },
  cardCol: { flex: 1 },
  fieldValue: { fontFamily: "Helvetica-Bold", fontSize: 12, marginTop: 3 },
  tableHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: C.line,
    paddingBottom: 6,
    marginTop: 10,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: C.lineSoft,
    paddingVertical: 10,
  },
  itemText: { fontFamily: "Helvetica-Bold", fontSize: 11 },
  totalsWrap: { alignItems: "flex-end", marginTop: 10 },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "50%",
    marginTop: 6,
  },
  totalBig: { fontFamily: "Helvetica-Bold", fontSize: 22 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: C.line,
    paddingTop: 12,
    marginTop: "auto",
    color: C.faint,
    fontSize: 9,
  },
});

function ReceiptPdf({ data }: { data: ReceiptDocData }) {
  const { business, customer } = data;
  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          {business.logoUrl ? (
            <Image src={business.logoUrl} style={s.logo} />
          ) : (
            <Text style={s.bizName}>{business.name}</Text>
          )}
          <View style={s.contact}>
            {business.phone ? (
              <Text style={s.contactLine}>{business.phone}</Text>
            ) : null}
            {business.email ? (
              <Text style={s.contactLine}>{business.email}</Text>
            ) : null}
            {business.address ? (
              <Text style={s.contactLine}>{business.address}</Text>
            ) : null}
          </View>
        </View>

        <View style={s.divider} />

        {/* Receipt / date */}
        <View style={[s.row, { marginTop: 22, alignItems: "flex-end" }]}>
          <View>
            <Text style={s.label}>Receipt</Text>
            <Text style={s.number}>{data.number}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={s.label}>Date</Text>
            <Text style={s.date}>{data.date}</Text>
          </View>
        </View>

        {/* Customer */}
        <Text style={[s.label, { marginTop: 22 }]}>Customer</Text>
        <View style={s.card}>
          <View style={s.cardCol}>
            <Text style={s.label}>Name</Text>
            <Text style={s.fieldValue}>{customer.name}</Text>
            {customer.email || customer.phone ? (
              <View style={{ marginTop: 12 }}>
                <Text style={s.label}>Phone / Email</Text>
                <Text style={s.fieldValue}>
                  {customer.email ?? customer.phone}
                </Text>
              </View>
            ) : null}
          </View>
          {data.referenceValue ? (
            <View style={s.cardCol}>
              <Text style={s.label}>{data.referenceLabel || "Reference"}</Text>
              <Text style={s.fieldValue}>{data.referenceValue}</Text>
            </View>
          ) : null}
        </View>

        {/* Services */}
        <Text style={[s.label, { marginTop: 26 }]}>Services</Text>
        <View style={s.tableHead}>
          <Text style={s.label}>Description</Text>
          <Text style={s.label}>Amount</Text>
        </View>
        {data.items.map((item, i) => (
          <View key={i} style={s.item}>
            <Text style={s.itemText}>{item.description}</Text>
            <Text style={s.itemText}>{money(item.amount)}</Text>
          </View>
        ))}

        {/* Totals */}
        <View style={s.totalsWrap}>
          <View style={s.totalsRow}>
            <Text style={{ color: C.sub }}>Subtotal</Text>
            <Text style={{ fontFamily: "Helvetica-Bold" }}>
              {money(data.total)}
            </Text>
          </View>
          <View style={[s.totalsRow, { alignItems: "center" }]}>
            <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 13 }}>
              Total
            </Text>
            <Text style={s.totalBig}>{money(data.total)}</Text>
          </View>
        </View>

        {/* Paid by */}
        {data.paidBy ? (
          <View style={{ marginTop: 26 }}>
            <Text style={s.label}>Paid by</Text>
            <Text style={s.fieldValue}>{data.paidBy}</Text>
          </View>
        ) : null}

        {/* Footer */}
        <View style={s.footer}>
          <Text>
            {business.footerNote || `Thank you for choosing ${business.name}.`}
          </Text>
          <Text>No taxes applied</Text>
        </View>
      </Page>
    </Document>
  );
}

export function renderReceiptPdfBlob(data: ReceiptDocData): Promise<Blob> {
  return pdf(<ReceiptPdf data={data} />).toBlob();
}
