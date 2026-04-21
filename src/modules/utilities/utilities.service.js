export async function deleteAllData(prisma) {
    await prisma.purchaseReturnDetail.deleteMany({});
    await prisma.purchaseReturn.deleteMany({});
    await prisma.saleReturnDetail.deleteMany({});
    await prisma.saleReturn.deleteMany({});
    await prisma.purchaseDetail.deleteMany({});
    await prisma.purchase.deleteMany({});
    await prisma.saleDetail.deleteMany({});
    await prisma.sale.deleteMany({});
    await prisma.stockInventory.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.additionalCost.deleteMany({});
    await prisma.adjustmentType.deleteMany({});
    await prisma.viewer.deleteMany({});
    await prisma.notificationDetail.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.receipt.deleteMany({});
    await prisma.productVariant.deleteMany({});
    await prisma.productDetail.deleteMany({});
    await prisma.product.deleteMany({});
}
