import multer from "multer";

// Use memory storage to keep file buffer in memory (no disk storage)
const storage = multer.memoryStorage();

const upload = multer({ storage });

export default upload;
