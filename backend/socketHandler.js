const { Server } = require('socket.io');
const Message = require('./models/Message'); // Import the Message model

const socketHandler = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on('connection', (socket) => {
    console.log('A user connected');

    // Join conversation
    socket.on('joinConversation', ({ conversationId, userId }) => {
      socket.join(conversationId);
      console.log(`User ${userId} joined conversation ${conversationId}`);
    });

    // Send message
    socket.on('sendMessage', async (messageData) => {
      try {
        // Emit the message to all clients in the conversation room
        io.to(messageData.conversationId).emit('receiveMessage', messageData);

        // Save the message to the database
        const newMessage = new Message({
          content: messageData.content,           // Message content
          conversationId: messageData.conversationId, // Conversation ID
          sender: messageData.senderId,           // Sender's ID
        });

        // Save the new message in the database
        await newMessage.save();

        console.log('Message saved and sent:', messageData);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });
};

module.exports = socketHandler;
