export type ContentItem = {
  id: string;
  objectId?: string;
  vaultId?: string;
  title: string;
  description: string;
  creator: string;
  ratePer10sSui: number;
  depositOptions: number[];
  tags: string[];
  pages: number;
  tone: string;
  pdfUrl: string;
  cover: {
    from: string;
    to: string;
  };
};

export const contentCatalog: ContentItem[] = [
  {
    id: "sui-growth-playbook",
    title: "Sui Growth Playbook",
    description:
      "Tactical distribution, pricing, and retention strategies for web3 content products.",
    creator: "0xA7...9F2",
    ratePer10sSui: 0.001,
    depositOptions: [0.05, 0.1, 0.5, 1],
    tags: ["growth", "strategy", "web3"],
    pages: 42,
    tone: "Operator-focused",
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    cover: {
      from: "#0b6b52",
      to: "#0b2430",
    },
  },
  {
    id: "micro-subscription-design",
    title: "Micro-Subscription UX",
    description:
      "Designing pay-per-time experiences that feel fair, fast, and trustable.",
    creator: "0xC1...4B9",
    ratePer10sSui: 0.0008,
    depositOptions: [0.05, 0.1, 0.25, 0.5],
    tags: ["ux", "payments", "product"],
    pages: 36,
    tone: "UX deep dive",
    pdfUrl: "https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf",
    cover: {
      from: "#f0b429",
      to: "#b65a2b",
    },
  },
  {
    id: "creator-revenue-loops",
    title: "Creator Revenue Loops",
    description:
      "Retention flywheels, tiered access, and analytics for premium creators.",
    creator: "0x98...2D1",
    ratePer10sSui: 0.0012,
    depositOptions: [0.1, 0.5, 1, 2],
    tags: ["creator", "revenue", "analytics"],
    pages: 54,
    tone: "Finance + ops",
    pdfUrl: "https://www.adobe.com/support/products/enterprise/knowledgecenter/media/c4611_sample_explain.pdf",
    cover: {
      from: "#23395d",
      to: "#4a6fa5",
    },
  },
];

export const getContentById = (id: string) =>
  contentCatalog.find((item) => item.id === id);
