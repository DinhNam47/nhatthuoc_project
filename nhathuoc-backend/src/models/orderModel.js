const { PrismaClient } = require('../generated/client');
const prisma = new PrismaClient();

// Tạo đơn hàng mới kèm transaction trừ số lượng tồn kho (quantity)
const createOrder = async ({
  userId,
  receiverName,
  phoneNumber,
  shippingAddress,
  note,
  paymentMethod,
  items,
  totalAmount
}) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Kiểm tra số lượng tồn kho của từng sản phẩm trước khi tạo đơn
    for (const item of items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        throw new Error(`Sản phẩm với ID ${item.productId} không tồn tại.`);
      }

      if (product.quantity < item.quantity) {
        throw new Error(`Sản phẩm "${product.name}" không đủ số lượng tồn kho (Hiện còn: ${product.quantity}).`);
      }
    }

    // 2. Tạo đơn hàng và chi tiết sản phẩm
    const newOrder = await tx.order.create({
      data: {
        userId,
        receiverName,
        phoneNumber,
        shippingAddress,
        note,
        paymentMethod: paymentMethod || "COD",
        totalAmount,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: {
        items: true
      }
    });

    // 3. Trừ số lượng tồn kho (quantity) của từng sản phẩm
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          quantity: {
            decrement: item.quantity
          }
        }
      });
    }

    return newOrder;
  });
};

// Lấy danh sách đơn hàng của một người dùng
const getOrdersByUserId = async (userId) => {
  return await prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              image: true,
              unit: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

// Lấy chi tiết một đơn hàng theo ID
const getOrderById = async (orderId) => {
  return await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              image: true,
              unit: true
            }
          }
        }
      },
      user: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      }
    }
  });
};

// Lấy danh sách tất cả đơn hàng (Dành cho Quản trị viên)
const getAllOrders = async () => {
  return await prisma.order.findMany({
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      },
      items: {
        include: {
          product: {
            select: {
              name: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

// Cập nhật trạng thái đơn hàng và trạng thái thanh toán
const updateOrderStatus = async (orderId, orderStatus, paymentStatus) => {
  const updateData = {};
  if (orderStatus) updateData.orderStatus = orderStatus;
  if (paymentStatus) updateData.paymentStatus = paymentStatus;

  return await prisma.order.update({
    where: { id: orderId },
    data: updateData
  });
};

module.exports = {
  createOrder,
  getOrdersByUserId,
  getOrderById,
  getAllOrders,
  updateOrderStatus
};