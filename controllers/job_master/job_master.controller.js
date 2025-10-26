import { models } from "../../models/index.js"; // Adjust the path as needed
const { JobMaster } = models;

// Create a Job
export const createJob = async (req, res) => {
  const { job_code, job_description } = req.body;

  try {
    const job = await JobMaster.create({ job_code, job_description });
    return res.status(201).json(job);
  } catch (error) {
    console.error("Error creating job:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get All Jobs
export const getJobs = async (req, res) => {
  try {
    const jobs = await JobMaster.findAll();
    return res.status(200).json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Job by ID
export const getJobById = async (req, res) => {
  const { id } = req.params;

  try {
    const job = await JobMaster.findByPk(id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    return res.status(200).json(job);
  } catch (error) {
    console.error("Error fetching job:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update Job
export const updateJob = async (req, res) => {
  const { id } = req.params;
  const { job_code, job_description } = req.body;

  try {
    const job = await JobMaster.findByPk(id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    await job.update({ job_code, job_description });
    return res.status(200).json(job);
  } catch (error) {
    console.error("Error updating job:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete Job
export const deleteJob = async (req, res) => {
  const { id } = req.params;

  try {
    const job = await JobMaster.findByPk(id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    await job.destroy();
    return res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Error deleting job:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
