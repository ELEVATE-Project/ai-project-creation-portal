import { GRITWORKS_BACKEND_ROUTES } from "../routes/routes";
import axiosInstance from "../utils/axios";


export async function getParaphraseText(user_input){
    try {
        const response = await axiosInstance.post(GRITWORKS_BACKEND_ROUTES.PARAPHRASE_API, {
            user_input
        });
        
        return response?.data?.paraphrased_output;
    } catch (error) {
        console.error('Error fetching Paraphrase api:', error);
        throw error;
    } 
}

export async function getObjectiveList(user_input){
    try {
        const response = await axiosInstance.post(GRITWORKS_BACKEND_ROUTES.OBJECTIVE_API, {
            user_input
        });
        
        return response?.data?.objective_list;
    } catch (error) {
        console.error('Error fetching Objective api:', error);
        throw error;
    } 
}

export async function getActionList(user_problem_statement, user_objective){
    try {
        const response = await axiosInstance.post(GRITWORKS_BACKEND_ROUTES.ACTION_LIST_API, {
            user_problem_statement,
            user_objective
        });
        
        return response?.data?.action_list;
    } catch (error) {
        console.error('Error fetching Action list api:', error);
        throw error;
    } 
}

export async function getTitle(user_problem_statement, user_objective, user_action_list){
    try {
        const response = await axiosInstance.post(GRITWORKS_BACKEND_ROUTES.TITLE_API, {
            user_problem_statement,
            user_objective,
            user_action_list
        });
      
        return response?.data?.title;
    } catch (error) {
        console.error('Error fetching Title api:', error);
        throw error;
    } 
}

export async function saveUserChatsInDB(chat_history, session){
    try {
        const response = await axiosInstance.post(GRITWORKS_BACKEND_ROUTES.SAVE_COMPANY_CHAT, {
            chat_history,
            session,
        });
      
        return response?.data;
    } catch (error) {
        console.error('Error fetching Title api:', error);
        throw error;
    } 
}


export async function getNewSessionID(){
    try {
        const response = await axiosInstance.get(GRITWORKS_BACKEND_ROUTES.GENERATE_SESSION_ID);
        
        return response?.data?.sessionid;
    } catch (error) {
        console.error('Error fetching Title api:', error);
        throw error;
    } 
}

export async function createChatSession(session){
    try {
        const response = await axiosInstance.post(GRITWORKS_BACKEND_ROUTES.CREATE_CHAT_SESSION, {
            session,
        });
      
        return response?.data;
    } catch (error) {
        console.error('Error fetching Title api:', error);
        throw error;
    } 
}

export async function updateChatSession(session, update_field){
    try {
        const response = await axiosInstance.patch(
            `${GRITWORKS_BACKEND_ROUTES.CHAT_SESSION}${session}/`, 
            {
                session,
                ...update_field
            }
        );
      
        return response?.data;
    } catch (error) {
        console.error('Error fetching Title api:', error);
        throw error;
    } 
}