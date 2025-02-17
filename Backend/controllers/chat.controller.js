const createChat = async (req, res) => {
    const fetch = (await import('node-fetch')).default;

    const chatFormat = {
        "model": "qwen2.5", 
        "prompt": req.body.prompt || "Why is the sky blue?" ,
        "stream": false,
    };

    try {
        const response = await fetch('http://mighty-monarch-refined.ngrok-free.app/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(chatFormat)
        });

        const content = await response.text();
        
        let data;
        try {
            data = JSON.parse(content);
        } catch (error) {
            throw new Error('Invalid JSON response');
        }

        res.send(data);
    } catch (error) {
        res.status(500).send('Error creating chat');
    }
};

const deleteChat = (req, res) => {
    res.send("Chat deleted successfully");
};

const updateChat = (req, res) => {
    res.send("Chat updated successfully");
};

const getChat = (req, res) => {
    res.send("Chat retrieved successfully");
};

module.exports = {
    createChat,
    deleteChat,
    updateChat,
    getChat
};