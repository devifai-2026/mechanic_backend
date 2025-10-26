import { models } from "../../models/index.js";
import XLSX from "xlsx";

const { Account, AccountGroup } = models;


export const createAccount = async (req, res) => {
  try {
    const account = await Account.create(req.body);
    res.status(201).json(account);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllAccounts = async (req, res) => {
  try {
    const accounts = await Account.findAll({
      include: {
        model: models.AccountGroup,
        as: "group", // This alias must match the alias in Account.associate
        attributes: ["id", "account_group_name", "account_group_code"], // optional, to limit returned fields
      },
    });

    res.status(200).json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAccountById = async (req, res) => {
  try {
    const account = await Account.findByPk(req.params.id, {
      include: [
        {
          association: "group", // This must match the alias used in Account.belongsTo
        },
      ],
    });

    if (!account) return res.status(404).json({ error: "Account not found" });

    res.status(200).json(account);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateAccount = async (req, res) => {
  try {
    const account = await Account.findByPk(req.params.id);
    if (!account) return res.status(404).json({ error: "Account not found" });

    await account.update(req.body);
    res.status(200).json(account);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const account = await Account.findByPk(req.params.id);
    if (!account) return res.status(404).json({ error: "Account not found" });

    await account.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const bulkUploadAccount = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    if (!rows.length) {
      return res.status(400).json({ message: "Excel sheet is empty" });
    }

    const results = [];

    for (const [index, row] of rows.entries()) {
      const { account_code, account_name, account_group } = row;

      if (!account_code || !account_name || !account_group) {
        results.push({
          row: index + 2,
          status: "failed",
          message: "Missing required fields (account_code, account_name, or account_group)",
        });
        continue;
      }

      try {
        // Find AccountGroup by name
        const group = await AccountGroup.findOne({ where: { account_group_name: account_group } });

        if (!group) {
          results.push({
            row: index + 2,
            status: "failed",
            message: `Account group "${account_group}" not found`,
          });
          continue;
        }

        // Create account with group id
        const account = await Account.create({
          account_code,
          account_name,
          account_group: group.id,
        });

        results.push({
          row: index + 2,
          status: "success",
          accountId: account.id,
        });
      } catch (error) {
        results.push({
          row: index + 2,
          status: "failed",
          message: error.message,
        });
      }
    }

    return res.status(201).json({
      message: "Bulk upload completed",
      results,
    });
  } catch (error) {
    console.error("Bulk upload Account error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
