

export function getFirstPageMessages(userDetail, userInput, userProblemStatement) {
    return {
        0: [
            { role: "bot", message: `Hi, ${userDetail.name}!`, messageId: '0_0' },
            { role: "bot", message: "What would you like to solve for your school today?", messageId: '0_1' }
        ],
        1: [
            { role: "user", message: userInput[0], messageId: '1_0' },
            { role: "bot", message: `Here's how I understand your challenge: ${userProblemStatement}`, messageId: '1_1' },
            { role: "bot", message: "Is this correct?", messageId: '1_2' }
        ],
        2: [
            { role: "user", message: userInput[1], messageId: '2_0' },
            { 
                role: "bot", 
                message: "Let's try again. Could you tell me about the challenge you are facing in more detail? I'll do my best to help you find the right solution!", 
                messageId: '2_1'
            },
        ],
        3: [
            { 
                role: "user", 
                message: userInput[2] ?? userInput[1], 
                messageId: '3_0' 
            },
        ]
    };
};


export function getSecondPageMessages() {
    return {
        4: [
            { 
                role: "bot", 
                message: "These are some objectives that could help address your challenge. Select one to get started.", 
                messageId: '4_0' 
            },
            { 
                role: "bot", 
                message: "Select one to proceed", 
                messageId: '4_1' 
            },
        ],
        5: [
            { role: "bot", message: "Enter your objective", messageId: '5_0' },
        ],
    };
}


export function getThirdPageMessages() {
    return {
        6: [
            { 
                role: "bot", 
                message: "Great choice! To achieve your objective, here are some actions you can take.", 
                messageId: '6_0' 
            },

        ],
        7: [
            { role: "bot", message: "Finalize Action List", messageId: '7_0' },
            { 
                role: "bot", 
                message: "You can edit, reorder, delete actions, or add your own to create the perfect plan!", 
                messageId: '7_1' 
            },
        ],
    };
}

export function getFourthPageMessages() {
    return {
        8: [
            { 
                role: "bot", 
                message: "How many weeks would you like to dedicate to this improvement? <br/>Slide to select.", 
                messageId: '8_0' 
            },

        ],
    };
}