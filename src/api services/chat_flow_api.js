import { BACKEND_ROUTES } from "../routes/routes";
import axiosInstance from "../utils/axios";


export async function getParaphraseText(user_input, language){
    try {
        const response = await axiosInstance.post(BACKEND_ROUTES.PARAPHRASE_API, {
            user_input,
            language
        });
        
        return response?.data?.paraphrased_output;
    } catch (error) {
        console.error('Error fetching Paraphrase api:', error);
        throw error;
    } 
}

export async function getObjectiveList(user_input, language){
    try {
        const response = await axiosInstance.post(BACKEND_ROUTES.OBJECTIVE_API, {
            user_input,
            language
        });
        
        return response?.data;
    } catch (error) {
        console.error('Error fetching Objective api:', error);
        throw error;
    } 
}

export async function getActionList(user_problem_statement, user_objective, language){
    try {
        const response = await axiosInstance.post(BACKEND_ROUTES.ACTION_LIST_API, {
            user_problem_statement,
            user_objective,
            language
        });
        
        return response?.data?.action_list;
    } catch (error) {
        console.error('Error fetching Action list api:', error);
        throw error;
    } 
}

export async function getTitle(user_problem_statement, user_objective, user_action_list, language){
    try {
        const response = await axiosInstance.post(BACKEND_ROUTES.TITLE_API, {
            user_problem_statement,
            user_objective,
            user_action_list,
            language
        });
      
        return response?.data?.title;
    } catch (error) {
        console.error('Error fetching Title api:', error);
        throw error;
    } 
}

export async function saveUserChatsInDB(message, session, role, chunks=null){
    try {
        const response = await axiosInstance.post(BACKEND_ROUTES.SAVE_COMPANY_CHAT, {
            message,
            role,
            session,
            chunks
        });
      
        return response?.data;
    } catch (error) {
        console.error('Error saving chats in db api:', error);
        throw error;
    } 
}


export async function getChatsFromDB(session){
    try {
        const response = await axiosInstance.get(`${BACKEND_ROUTES.GET_COMPANY_CHAT}?session=${session}`);
      
        return response?.data;
    } catch (error) {
        console.error('Error saving chats in db api:', error);
        throw error;
    } 
}


export async function getNewSessionID(){
    try {
        const response = await axiosInstance.get(BACKEND_ROUTES.GENERATE_SESSION_ID);
        
        return response?.data?.sessionid;
    } catch (error) {
        console.error('Error fetching sessionid api:', error);
        throw error;
    } 
}

export async function createChatSession(session, email, access_token){
    try {
        const response = await axiosInstance.post(BACKEND_ROUTES.CREATE_CHAT_SESSION, {
            session,
            email,
        },{
            headers: {
                'X-auth-token': access_token,
            },
        });
      
        return response?.data;
    } catch (error) {
        console.error('Error Creating Chatsession api:', error);
        throw error;
    } 
}

export async function createProject(
    access_token, user_problem_statement, user_action_steps, project_duration, 
    project_title, profile_id, session, user_objective, chunks
){
    try {
        const response = await axiosInstance.post(
            `${BACKEND_ROUTES.CREATE_PROJECT}`, 
            {
                access_token,
                user_problem_statement,
                user_action_steps,
                project_duration, 
                project_title,
                profile_id,
                session,
                user_objective,
                chunks
            }
        );
      
        return response?.data?.result;
    } catch (error) {
        console.error('Error creating Project api:', error);
        throw error;
    } 
}

export async function updateChatSession(session, update_field){
    try {
        const response = await axiosInstance.patch(
            `${BACKEND_ROUTES.CHAT_SESSION}${session}/`, 
            {
                session,
                ...update_field
            }
        );
      
        return response?.data;
    } catch (error) {
        console.error('Error Updating Chatsession:', error);
        throw error;
    } 
}