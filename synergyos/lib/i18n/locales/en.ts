const en = {
  navigation: {
    brand: "SynergyOS",
    subtitle: "AI Fulfillment Platform",
    sections: {
      dashboard: "Dashboard",
      orders: "Orders",
      warehouse: "Warehouse",
      crm: "CRM",
      transport: "Transport",
      finance: "Finance",
      ai: "AI Command Center",
    },
    languageLabel: "Language",
    languageSwitcher: {
      cs: "Česky",
      en: "English",
    },
  },
  orders: {
    eyebrow: "Order management",
    title: "Order management",
    subtitle: "A searchable order overview with status handling prepared for future database integration.",
    cta: "+ Create order",
    searchLabel: "Search",
    searchPlaceholder: "Search by order number, customer, or shop",
    statusLabel: "Status",
    statuses: {
      all: "All",
      new: "New",
      picking: "Picking",
      packed: "Packed",
      shipped: "Shipped",
      delivered: "Delivered",
    },
    table: {
      order: "Order",
      customer: "Customer",
      status: "Status",
      carrier: "Carrier",
      items: "Items",
      total: "Total",
      view: "View",
    },
    pagination: {
      showing: "Showing",
      of: "of",
      previous: "Previous",
      next: "Next",
    },
    detail: {
      eyebrow: "Order details",
      subtitle: "Operational and logistics overview for this shipment.",
      back: "Back to orders",
      summary: "Order summary",
      customer: "Customer",
      address: "Delivery address",
      carrier: "Carrier",
      promiseDate: "Promise date",
      notes: "Notes",
      timeline: {
        title: "Timeline",
        created: "Created at",
        updated: "Last updated",
      },
      fulfillment: {
        title: "Fulfillment details",
        items: "Item count",
        total: "Order value",
        slot: "Warehouse slot",
        tracking: "Tracking",
      },
    },
  },
  dashboard: {
    eyebrow: "Fulfillment command center",
    title: "Operational overview",
    subtitle: "A clear view of orders, throughput, and carrier health across the network.",
    cta: "+ Create fulfillment run",
    kpis: {
      ordersToday: {
        label: "Orders today",
        change: "+12% vs yesterday",
      },
      readyToPack: {
        label: "Ready to pack",
        change: "6 urgent",
      },
      shippedToday: {
        label: "Shipped today",
        change: "+8% efficiency",
      },
      returns: {
        label: "Returns",
        change: "1 pending review",
      },
    },
    revenue: {
      title: "Revenue trend",
      subtitle: "Last 7 days",
      change: "+18.4% MoM",
    },
    occupancy: {
      title: "Warehouse occupancy",
      subtitle: "Current capacity",
      badge: "Healthy",
      label: "2,340 / 3,000 slots",
      description: "Picking lanes are running at 78% capacity.",
      peak: "Peak window",
      peakDescription: "11:00–14:00 with 2 extra pickers recommended.",
    },
    ordersOverTime: {
      title: "Orders over time",
      subtitle: "Daily throughput",
    },
    carrierStats: {
      title: "Carrier stats",
      subtitle: "Preferred shipping mix",
    },
    topCustomers: {
      title: "Top customers",
      subtitle: "Highest revenue contributors",
      action: "This quarter",
    },
    recentOrders: {
      title: "Recent orders",
      subtitle: "Latest fulfillment activity",
    },
    quickActions: {
      title: "Quick actions",
      subtitle: "Accelerate daily ops",
      batchLabels: {
        title: "Batch print labels",
        description: "Print 24 pending labels in one pass",
      },
      reassignCarrier: {
        title: "Reassign carrier",
        description: "Optimize late shipments to a faster route",
      },
      approveReturns: {
        title: "Approve returns",
        description: "Review three exceptions before close of day",
      },
    },
    notifications: {
      title: "Notifications",
      subtitle: "Team updates",
      items: [
        {
          title: "Inventory alert",
          text: "4 SKUs below reorder point",
          time: "12 min ago",
        },
        {
          title: "Carrier delay",
          text: "DPD hub congestion in Prague",
          time: "34 min ago",
        },
        {
          title: "New return",
          text: "One order requires quality review",
          time: "1h ago",
        },
      ],
    },
    placeholder: {
      title: "This module is ready for the next step in the SynergyOS product roadmap.",
    },
    chartLabels: {
      mon: "Mon",
      tue: "Tue",
      wed: "Wed",
      thu: "Thu",
      fri: "Fri",
      sat: "Sat",
      sun: "Sun",
    },
    table: {
      customer: "Customer",
      revenue: "Revenue",
      orders: "Orders",
      tier: "Tier",
      order: "Order",
      carrier: "Carrier",
      status: "Status",
      time: "Time",
    },
    orderStatuses: {
      packed: "Packed",
      inTransit: "In transit",
      ready: "Ready",
      queued: "Queued",
    },
  },
};

export default en;
