const createChat = async (req, res) => {
    const fetch = (await import('node-fetch')).default;

    const chatFormat = {
        "model": "llama3.1", //any models pulled from Ollama can be replaced here
        "prompt": "Why is the sky blue?" //The prompt should be written here
    };

    try {
        const response = await fetch('http://mighty-monarch-refined.ngrok-free.app', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(chatFormat)
        });
        const data = await response.json();
        console.log('data: ', data);
        res.send(data);
    } catch (error) {
        console.log('error: ', error);
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