import AppError from '../../utils/appError.js';
const validateDate = (date) => {
    const d = new Date(date);
    return !isNaN(d.getTime());
};
export async function getSalesReport(prisma, query) {
    const { fromDate, toDate, categoryId, brandId, groupId, customerId, paymentTypeId, branchId } = query;
    if (!validateDate(fromDate) || !validateDate(toDate))
        throw new AppError('Invalid date format. Please use YYYY-MM-DD', 400);
    const start = new Date(fromDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(toDate);
    end.setHours(23, 59, 59, 999);
    const where = { createdAt: { gte: start, lte: end } };
    if (categoryId)
        where.categoryId = categoryId;
    if (brandId)
        where.brandId = brandId;
    if (groupId)
        where.groupId = groupId;
    if (customerId)
        where.customerId = customerId;
    if (paymentTypeId)
        where.paymentTypeId = paymentTypeId;
    if (branchId)
        where.branchId = branchId;
    const sales = await prisma.sale.findMany({
        where,
        select: {
            ref: true,
            branch: { select: { name: true } },
            customer: { select: { name: true } },
            subTotal: true,
            discountAmount: true,
            taxAmount: true,
            total: true,
            due: true,
            paid: true,
            paymentTypeId: true,
            createdAt: true,
            saleDetails: { select: { quantity: true } },
        },
        orderBy: { createdAt: 'desc' },
    });
    return sales.map((sale) => ({
        invoice: sale.ref,
        date: sale.createdAt,
        branchName: sale.branch?.name || null,
        customerName: sale.customer?.name || null,
        subTotal: sale.subTotal,
        discountAmount: sale.discountAmount,
        taxAmount: sale.taxAmount,
        total: sale.total,
        due: sale.due,
        paid: sale.paid,
        paymentTypeId: sale.paymentTypeId,
        totalItems: sale.saleDetails.reduce((sum, detail) => sum + (detail.quantity ?? 0), 0),
        createdAt: sale.createdAt,
    }));
}
export async function getSalesDetailsReport(prisma, query) {
    const { fromDate, toDate, categoryId, brandId, groupId, customerId, paymentTypeId, branchId } = query;
    if (!validateDate(fromDate) || !validateDate(toDate))
        throw new AppError('Invalid date format. Please use YYYY-MM-DD', 400);
    const conditions = [`s.created_at BETWEEN '${fromDate}' AND '${toDate}'`];
    if (categoryId)
        conditions.push(`p.category_id = '${categoryId}'`);
    if (brandId)
        conditions.push(`p.brand_id = '${brandId}'`);
    if (groupId)
        conditions.push(`p.group_id = '${groupId}'`);
    if (customerId)
        conditions.push(`s.customer_id = '${customerId}'`);
    if (paymentTypeId)
        conditions.push(`s.payment_type_id = '${paymentTypeId}'`);
    if (branchId)
        conditions.push(`s.branch_id = '${branchId}'`);
    const sql = `
    SELECT 
      s.id as sale_id, s.ref as invoice, s.created_at as date,
      c.name as customer, b.name as branch, s.total as total_amount,
      s.discount_amount, s.tax_amount, sd.quantity as qty, sd.price as rate,
      (sd.quantity * sd.price) as amount, p.name as product_name, p.product_type,
      STRING_AGG(pv.variant_value, ', ') as variants
    FROM sales s
    LEFT JOIN customers c ON s.customer_id = c.id
    LEFT JOIN branches b ON s.branch_id = b.id
    LEFT JOIN sale_details sd ON sd.sale_id = s.id
    LEFT JOIN products p ON sd.product_id = p.id
    LEFT JOIN product_details pd ON sd.product_detail_id = pd.id
    LEFT JOIN product_variants pv ON pv.product_detail_id = pd.id
    WHERE ${conditions.join(' AND ')}
    GROUP BY s.id, s.ref, s.created_at, c.name, b.name, s.total, s.discount_amount, s.tax_amount,
             sd.id, sd.quantity, sd.price, p.name, p.product_type
    ORDER BY s.created_at DESC, s.id, sd.id
  `;
    const rows = await prisma.$queryRawUnsafe(sql);
    const salesMap = new Map();
    for (const row of rows) {
        if (!salesMap.has(row.sale_id)) {
            salesMap.set(row.sale_id, {
                invoice: row.invoice,
                date: row.date,
                customer: row.customer,
                branch: row.branch,
                totalAmount: row.total_amount,
                discountAmount: row.discount_amount,
                taxAmount: row.tax_amount,
                items: [],
            });
        }
        const sale = salesMap.get(row.sale_id);
        sale.items.push({
            product: row.product_type === 'variant' && row.variants ? `${row.product_name} (${row.variants})` : row.product_name,
            qty: row.qty,
            rate: row.rate,
            amount: row.amount,
        });
    }
    return Array.from(salesMap.values());
}
export async function getSalesSummaryReport(prisma, query) {
    const { fromDate, toDate, groupBy, branchId } = query;
    if (!validateDate(fromDate) || !validateDate(toDate))
        throw new AppError('Invalid date format. Please use YYYY-MM-DD', 400);
    const queryConfig = {
        category: {
            select: 'c.name as "Category"',
            joins: 'LEFT JOIN products p ON sd.product_id = p.id LEFT JOIN categories c ON p.category_id = c.id',
            groupBy: 'c.name',
        },
        brand: {
            select: 'b.name as "Brand"',
            joins: 'LEFT JOIN products p ON sd.product_id = p.id LEFT JOIN brands b ON p.brand_id = b.id',
            groupBy: 'b.name',
        },
        group: {
            select: 'g.name as "Group"',
            joins: 'LEFT JOIN products p ON sd.product_id = p.id LEFT JOIN groups g ON p.group_id = g.id',
            groupBy: 'g.name',
        },
        product: {
            select: 'p.name as "Product"',
            joins: 'LEFT JOIN products p ON sd.product_id = p.id',
            groupBy: 'p.name',
        },
        customer: {
            select: 'cu.name as "Customer"',
            joins: 'LEFT JOIN customers cu ON s.customer_id = cu.id',
            groupBy: 'cu.name',
        },
        employee: {
            select: 'u.name as "Employee"',
            joins: 'LEFT JOIN users u ON s.created_by_id = u.id',
            groupBy: 'u.name',
        },
        date: { select: 'DATE(s.created_at) as "Date"', joins: '', groupBy: 'DATE(s.created_at)' },
    };
    const config = queryConfig[groupBy || 'date'];
    if (!config)
        throw new AppError('Invalid groupBy value', 400);
    const branchFilter = branchId ? `AND s.branch_id = '${branchId}'` : '';
    const sql = `
    SELECT ${config.select},
      SUM(sd.quantity) as "Items Sold",
      SUM(sd.quantity * sd.price) as "Sub Total",
      SUM(sd.quantity * sd.price * COALESCE(s.tax_percentage, 0) / 100) as "Tax",
      SUM(sd.discount_amount) as "Discount",
      SUM(sd.quantity * sd.price - sd.discount_amount + (sd.quantity * sd.price * COALESCE(s.tax_percentage, 0) / 100)) as "Total"
    FROM sales s
    LEFT JOIN sale_details sd ON sd.sale_id = s.id ${config.joins}
    WHERE s.created_at BETWEEN '${fromDate}' AND '${toDate}' ${branchFilter}
    GROUP BY ${config.groupBy}
  `;
    return prisma.$queryRawUnsafe(sql);
}
export async function getSalesSummaryPerCustomer(prisma, fromDate, toDate) {
    if (!validateDate(fromDate) || !validateDate(toDate))
        throw new AppError('Invalid date format. Please use YYYY-MM-DD', 400);
    const start = new Date(fromDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(toDate);
    end.setHours(23, 59, 59, 999);
    const sales = await prisma.sale.groupBy({
        by: ['customerId'],
        where: { createdAt: { gte: start, lte: end }, customerId: { not: null } },
        _sum: { subTotal: true, taxAmount: true, discountAmount: true, total: true },
        _count: { _all: true },
    });
    const customerIds = sales.map((s) => s.customerId).filter((id) => id !== null);
    const customers = await prisma.customer.findMany({
        where: { id: { in: customerIds } },
        select: { id: true, name: true },
    });
    const customerMap = new Map(customers.map((c) => [c.id, c.name]));
    return sales
        .map((sale) => ({
        customer: customerMap.get(sale.customerId) || 'Unknown Customer',
        totalAmount: sale._sum?.subTotal || 0,
        totalTax: sale._sum?.taxAmount || 0,
        totalDiscount: sale._sum?.discountAmount || 0,
        totalSales: sale._sum?.total || 0,
        invoiceCount: sale._count?._all || 0,
    }))
        .sort((a, b) => a.customer.localeCompare(b.customer));
}
export async function getSalesSummaryPerBranch(prisma, fromDate, toDate) {
    if (!validateDate(fromDate) || !validateDate(toDate))
        throw new AppError('Invalid date format. Please use YYYY-MM-DD', 400);
    const start = new Date(fromDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(toDate);
    end.setHours(23, 59, 59, 999);
    const sales = await prisma.sale.groupBy({
        by: ['branchId'],
        where: { createdAt: { gte: start, lte: end }, branchId: { not: null } },
        _sum: { subTotal: true, taxAmount: true, discountAmount: true, total: true },
        _count: { _all: true },
    });
    const branchIds = sales.map((s) => s.branchId).filter((id) => id !== null);
    const branches = await prisma.branch.findMany({
        where: { id: { in: branchIds } },
        select: { id: true, name: true },
    });
    const branchMap = new Map(branches.map((b) => [b.id, b.name]));
    return sales
        .map((sale) => ({
        branch: branchMap.get(sale.branchId) || 'Unknown Branch',
        totalAmount: sale._sum?.subTotal || 0,
        totalTax: sale._sum?.taxAmount || 0,
        totalDiscount: sale._sum?.discountAmount || 0,
        totalSales: sale._sum?.total || 0,
        invoiceCount: sale._count?._all || 0,
    }))
        .sort((a, b) => a.branch.localeCompare(b.branch));
}
