import { File } from "../model/files.model.js";

export const uploadInMongoDB = async (file, userId) => {
    console.log(file, userId);
    if (!file) {
        throw new Error("No file uploaded");
    }
    if (!userId) {
        throw new Error("Unauthorized");
    }
    try {
        const newFile = await File.create({ filename: file.filename, path: file.path, userId: userId });
        return newFile;
    } catch (error) {
        console.error("Error uploading file to MongoDB:", error);
        throw error;
    }
};

export const getFileFromMongoDB = async (id) => {
    try {
        const file = await File.findById(id);
        return file;
    } catch (error) {
        console.error("Error getting file from MongoDB:", error);
        throw error;
    }
};

export const deleteFileFromMongoDB = async (id) => {
    try {
        await File.findByIdAndDelete(id);
    } catch (error) {
        console.error("Error deleting file from MongoDB:", error);
        throw error;
    }
};