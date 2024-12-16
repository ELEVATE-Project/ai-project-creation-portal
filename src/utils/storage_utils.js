

export function setEncodedLocalStorage(key, value) {

    if (typeof key !== "string") {
        throw new Error("The variable is not a string!");
    }

    const jsonData = JSON.stringify(value);

    const encodedData = btoa(jsonData);

    localStorage.setItem(key, encodedData);

}

export function getEncodedLocalStorage(key) {

    if (typeof key !== "string") {
        throw new Error("The variable is not a string!");
    }
    const encodedData = localStorage.getItem(key);
    if (!encodedData) {
        console.warn(`No data found in localStorage for key: ${key}`);
        return null;
    }
    try {
        const decodedData = atob(encodedData); 
        const originalData = JSON.parse(decodedData);
        // console.log('originalData: ', originalData) 
        return originalData; 
    } catch (error) {
        console.error("Error reading from localStorage:", error.message);
        throw new Error("Failed to decode or parse the stored data.");
    }
}