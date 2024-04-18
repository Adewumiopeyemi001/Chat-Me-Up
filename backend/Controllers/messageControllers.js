const asyncHandler = require("express-async-handler");
const Message = require("../Models/messageModel");
const User = require("../Models/userModel");
const Chat = require("../Models/chatModel");

exports.sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  // Validate request data
  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.status(400).json({ error: "Content and chatId are required" });
  }

  try {
    // Create new message
    const newMessage = {
      sender: req.user._id,
      content: content,
      chat: chatId,
    };
    let message = await Message.create(newMessage);

    // Populate sender and chat details
      message = await message.populate("sender", "name pic");
      message = await message.populate("chat");

    // Populate chat users
    const populatedMessage = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    // Update chat's latestMessage
    await Chat.findByIdAndUpdate(chatId, { latestMessage: populatedMessage });

    // Respond with the created and populated message
    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

exports.allMessages = asyncHandler(async (req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate("sender", "name pic email")
            .populate("chat");
        
        res.json(messages);
    } catch (error) {
        res.status(400);
        throw new Error(error.message)
    }
});
