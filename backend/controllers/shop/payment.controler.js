
const Order = require('../../models/order.model');
const Cart = require("../../models/cart.model");
const Product = require("../../models/product.model");
const axios = require('axios');
const crypto = require('crypto');

// eSewa API Configuration
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q';
const ESEWA_PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST';
const ESEWA_API_URL = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form'; // For test environment
// const ESEWA_API_URL = 'https://epay.esewa.com.np/api/epay/main/v2/form'; // For production

// 1️⃣ Create Order and Initiate eSewa Payment
const createOrder = async (req, res) => {
  try {
    const {
      userId,
      cartItems,
      addressInfo,
      paymentMethod,
      totalAmount,
      orderDate,
      orderUpdateDate,
      cartId,
    } = req.body;

    // Create order in database first
    const newlyCreatedOrder = new Order({
      userId,
      cartId,
      cartItems,
      addressInfo,
      orderStatus: "pending",
      paymentMethod: "esewa",
      paymentStatus: "pending",
      totalAmount,
      orderDate,
      orderUpdateDate,
      paymentId: null,
    });

    await newlyCreatedOrder.save();

    // Prepare eSewa payment initiation payload
    const transaction_uuid = newlyCreatedOrder._id.toString();
    const message = `total_amount=${totalAmount},transaction_uuid=${transaction_uuid},product_code=${ESEWA_PRODUCT_CODE}`;
    
    const signature = crypto.createHmac('sha256', ESEWA_SECRET_KEY)
                            .update(message)
                            .digest('base64');

    const eSewaPayload = {
      amount: totalAmount,
      tax_amount: 0,
      total_amount: totalAmount,
      transaction_uuid: transaction_uuid,
      product_code: ESEWA_PRODUCT_CODE,
      product_service_charge: 0,
      product_delivery_charge: 0,
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/shop/payment-success`,
      failure_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/shop/payment-success`,
      signed_field_names: 'total_amount,transaction_uuid,product_code',
      signature: signature,
    };

    return res.status(200).json({
      success: true,
      payment_url: ESEWA_API_URL,
      formData: eSewaPayload,
      orderId: newlyCreatedOrder._id,
    });
  } catch (error) {
    console.error('eSewa initiate error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment initiation failed',
      error: error.message,
    });
  }
};

// 2️⃣ Capture Payment - Verify eSewa Payment
const capturePayment = async (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        message: 'data is required',
      });
    }

    // Decode the base64 data from eSewa
    const decodedData = Buffer.from(data, 'base64').toString('utf-8');
    const paymentData = JSON.parse(decodedData);

    const {
      status,
      transaction_code,
      transaction_uuid,
      total_amount,
    } = paymentData;

    console.log("eSewa response data:", paymentData);

    // Check if payment is completed
    if (status === 'COMPLETE') {
      // Find and update order
      const order = await Order.findById(transaction_uuid);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      // Update order status
      order.paymentStatus = 'paid';
      order.orderStatus = 'confirmed';
      order.paymentId = transaction_code;

      // Update product stock
      for (let item of order.cartItems) {
        const product = await Product.findById(item.productId);
        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Product not found: ${item.productId}`,
          });
        }
        
        if (product.totalStock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for product: ${product.title}`,
          });
        }
        
        product.totalStock -= item.quantity;
        await product.save();
      }

      // Delete cart after order confirmation
      await Cart.findByIdAndDelete(order.cartId);
      
      await order.save();

      return res.status(200).json({
        success: true,
        message: 'Payment verified and order confirmed',
        data: order,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: `Payment status: ${status}`,
        status: status,
      });
    }
  } catch (error) {
    console.error('eSewa verify error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message,
    });
  }
};

// 3️⃣ Get all orders by user
const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId }).sort({ orderDate: -1 });

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found",
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: "An error occurred",
    });
  }
};

// 4️⃣ Get order details
const getOrdersDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Get order detail error:', error);
    res.status(500).json({
      success: false,
      message: "An error occurred",
    });
  }
};

module.exports = {
  createOrder,
  capturePayment,
  getAllOrdersByUser,
  getOrdersDetail,
};



// const Order = require('../../models/order.model');
// const Cart = require("../../models/cart.model");
// const Product = require("../../models/product.model");


// const createOrder = async (req, res) => {
//   try {
//     const {
//       userId,
//       cartItems,
//       addressInfo,
//       paymentMethod,
//       totalAmount,
//       orderDate,
//       orderUpdateDate,
//       cartId,
//     } = req.body;

//     const newlyCreatedOrder = new Order({
//       userId,
//       cartId,
//       cartItems,
//       addressInfo,
//       orderStatus: "Pending",      // Payment not done yet
//       paymentMethod,
//       paymentStatus: "Pending",
//       totalAmount,
//       orderDate,
//       orderUpdateDate,
//       paymentId: null,
//     });

//     await newlyCreatedOrder.save();

//     res.status(201).json({
//       success: true,
//       message: "Order created, ready for Khalti payment",
//       orderId: newlyCreatedOrder._id,
//     });
//   } catch (e) {
//     console.log(e);
//     res.status(500).json({
//       success: false,
//       message: "Error creating order",
//     });
//   }
// };

// // 2️⃣ Verify Khalti payment and capture
// const  capturePayment = async (req, res) => {
//   try {
//     const { token, amount, orderId } = req.body;

//     const order = await Order.findById(orderId);
//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found",
//       });
//     }

//     // Khalti Payment Verification API
//     const response = await axios.post(
//       "https://khalti.com/api/v2/payment/verify/",
//       { token, amount },
//       { headers: { Authorization: `Key ${process.env.KHALTI_SECRET_KEY}` } }
//     );

//     if (response.data && response.data.idx) {
//       // Payment successful
//       order.paymentStatus = "Paid";
//       order.orderStatus = "Confirmed";
//       order.paymentId = response.data.idx;

//       // Update product stock
//       for (let item of order.cartItems) {
//         const product = await Product.findById(item.productId);
//         if (!product) {
//           return res.status(404).json({
//             success: false,
//             message: `Product not found: ${item.productId}`,
//           });
//         }
//         product.totalStock -= item.quantity;
//         await product.save();
//       }

//       // Delete cart after order confirmation
//       await Cart.findByIdAndDelete(order.cartId);
//       await order.save();

//       return res.status(200).json({
//         success: true,
//         message: "Order confirmed",
//         data: order,
//       });
//     } else {
//       return res.status(400).json({
//         success: false,
//         message: "Payment verification failed",
//       });
//     }

//   } catch (error) {
//     console.log(error.response?.data || error);
//     return res.status(500).json({
//       success: false,
//       message: "Error verifying payment",
//     });
//   }
// };

// // 3️⃣ Get all orders by user
// const getAllOrdersByUser = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const orders = await Order.find({ userId });

//     if (!orders.length) {
//       return res.status(404).json({
//         success: false,
//         message: "No orders found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: orders,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "An error occurred",
//     });
//   }
// };

// // 4️⃣ Get order details
// const getOrdersDetail = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const order = await Order.findById(id);

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: order,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "An error occurred",
//     });
//   }
// };

// module.exports = {
//   createOrder,
//   capturePayment,
//   getAllOrdersByUser,
//   getOrdersDetail,
// };


// const createOrder = async (req, res) => {

//     const mercadoPago = new MercadoPagoConfig({
//         accessToken:'APP_USR-7127313862060433-090914-ad385fc625344ac34978fead21475333-2682535062'
//     })


//   try {
//     const {
//       userId,
//       cartItems,
//       addressInfo,
//       orderStatus,
//       paymentMethod,
//       paymentStatus,
//       totalAmount,
//       orderDate,
//       orderUpdateDate,
//       cartId,
//     } = req.body;

//     const items = cartItems.map((item) => ({
//       title: item.title,
//       quantity: item.quantity,
//       unit_price: Number(item.price),
//       currency_id: "NPR",
//     }));

//     // const preference =  await new Preference(mercadoPago).create({
//     // body:{
//     //   items,
//     //   back_urls: {
//     //     success: "https://sendasalud.cloud/shop/mercadoPagoReturn",
//     //     failure: "http://sendasalud.cloud/shop/mercadopago-failure",
//     //     pending: "http://sendasalud.cloud/shop/mercadopago-pending",
//     //   },
//     //   auto_return: "approved",
//     //   external_reference: userId,
//     //   //notification_url:"https://1567a1d0bd88.ngrok-free.app/mercadoPagoReturnel"
//     // }});
 
//     // console.log('Preferencia creada : ', preference)
//     const newlyCreatedOrder = new Order({
//       userId,
//       cartId,
//       cartItems,
//       addressInfo,
//       orderStatus,
//       paymentMethod,
//       paymentStatus,
//       totalAmount,
//       orderDate,
//       orderUpdateDate,
//       paymentId: null,
//       payerId: null,
//     });

//     await newlyCreatedOrder.save();

//     res.status(201).json({
//       success: true,
//       approvalURL: preference.init_point,
//       orderId: newlyCreatedOrder._id,
//     });
//   } catch (e) {
//     console.log(e);
//     res.status(500).json({
//       success: false,
//       message: "Error al crear la preferencia de MercadoPago",
//     });
//   }
// };


// const capturePayment = async (req, res) => {
//   try {
//     const { paymentId, /*payerId,*/ orderId } = req.body;
//     let order = await Order.findById(orderId);
//     if (!orderId) {
//       return res.status(404).json({
//         success: false,
//         message: "Orden de Compra no encontrada",
//       });
//     }

//     order.paymentStatus = "Pagado";
//     order.orderStatus = "Confirmado";
//     order.paymentId = paymentId;
//     /*order.payerId = payerId;*/

//     for (let item of order.cartItems) {
//       let product = await Product.findById(item.productId);
//       if (!product) {
//         return res.status(404).json({
//           success: false,
//           message: `Sin Stock suficiente para este producto: ${product.title}`,
//         });
//       }
//       product.totalStock -= item.quantity;
//       await product.save();
//     }

//     const getCartId = order.cartId;
//     await Cart.findByIdAndDelete(getCartId);

//     await order.save();
//     res.status(200).json({
//       success: true,
//       message: "Orden Confirmada",
//       data: order,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Ocurrio un error",
//     });
//   }
// };

// const getAllOrdersByUser = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const orders = await Order.find({ userId });

//     if (!orders.length) {
//       return res.status(404).json({
//         success: false,
//         message: "No se encontraron ordenes de compra",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: orders,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Ocurrio algun error",
//     });
//   }
// };

// const getOrdersDetail = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const order = await Order.findById(id);

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "No se encontro la orden de compra",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: order,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Ocurrio algun error",
//     });
//   }
// };

// module.exports = {
//   createOrder,
//   capturePayment,
//   getAllOrdersByUser,
//   getOrdersDetail,
// };
// */
