
import { getFirstPendingInvoice, getInvoiceJSON } from './controllers/invoiceController';
import { sequelize } from './database';
import { Company } from './models/company';
import { InvoiceItem } from './models/invoiceItem';

// test database connection with sequelize
sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
    main();
}).catch((error) => {
    console.error('Unable to connect to the database:', error);
})

async function main() {
  const invoice = await getFirstPendingInvoice();
  if (!invoice) {
      console.log("No pending invoices found");
      return;
  }
  const company = await Company.findOne({where: {id: invoice.companyId}});
  if (!company) {
      console.log("Company not found");
      return;
  }
  const invoiceItems = await InvoiceItem.findAll({where: {invoiceId: invoice.id}});
  if (!invoiceItems) {
      console.log("No invoice items found");
      return;
  }
  const invoiceJSON = await getInvoiceJSON(invoice, company, invoiceItems);
  console.log('invoiceJSON', invoiceJSON)
}