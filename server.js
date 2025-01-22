const express = require('express');
const bodyParser = require('body-parser');
const excel = require('exceljs');
const cors = require('cors');
const xlsx = require('xlsx');
const path = require('path');
const nodemailer = require('nodemailer');
const chokidar = require('chokidar');
const fs = require('fs');
const app = express();
let worker = '';

const PORT = process.env.PORT || 4455; // PORTS
const receiver_email = 'hodlondreamlife@gmail.com';
require('dotenv').config();  // Load environment variables from .env file
const employee_name = 'Jamal Zurba'

app.use(express.static('public'));
const corsOptions = {
    origin: '*', // Allow all origins (this is for all devices on the same network)
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization'
};

// Set up nodemailer transport using Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,  // User from environment variable
        pass: process.env.PASS    // Password from environment variable
    }
});


app.use(cors(corsOptions));
app.use(express.json()); // No need for body-parser if using Express 4.16+


// Function to get the formatted date (MONTH/DAY)
function getFormattedDate(date) {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${month}/${day}`;
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Example of endpoint to get formatted data from Excel file
app.get('/get-companies', (req, res) => {
    // Path to the Excel file (total.xlsx)
    const filePath = path.join(__dirname, 'data_excel/total.xlsx');

    // Read the Excel file
    const workbook = xlsx.readFile(filePath);

    // Get the first sheet's data
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert the sheet data to JSON
    const rawData = xlsx.utils.sheet_to_json(sheet);

    // Format the data as desired based on the new structure
    const companies = rawData.map(row => ({
        name: row['Company Name'],  // Company Name column in Excel
        code: row['Code'],          // Code column in Excel
        location: row['Location'],  // Location column in Excel
        city: row['City'],          // City column in Excel
        employee: row['employee']   // Employee column in Excel
    }));

    // Send the formatted data to the frontend
    res.json(companies);
});

// Example of endpoint to get formatted data from Excel file
app.get('/get-cities', (req, res) => {
    // Path to the Excel file (total.xlsx)
    const filePath = path.join(__dirname, 'data_excel/citys.xlsx');

    // Read the Excel file
    const workbook = xlsx.readFile(filePath);

    // Get the first sheet's data
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert the sheet data to JSON
    const rawData = xlsx.utils.sheet_to_json(sheet);

    // Format the data as desired based on the new structure
    const companies = rawData.map(row => ({
        city: row['city'],          // City column in Excel
             
    }));

    // Send the formatted data to the frontend
    res.json(companies);
});

// Example of endpoint to get formatted data from Excel file
app.get('/get-locations', (req, res) => {
    // Path to the Excel file (total.xlsx)
    const filePath = path.join(__dirname, 'data_excel/locations.xlsx');

    // Read the Excel file
    const workbook = xlsx.readFile(filePath);

    // Get the first sheet's data
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert the sheet data to JSON
    const rawData = xlsx.utils.sheet_to_json(sheet);

    // Format the data as desired based on the new structure
    const companies = rawData.map(row => ({
        location: row['location'],          // City column in Excel
            
    }));

    // Send the formatted data to the frontend
    res.json(companies);
});

app.post('/visit', (req, res) => {
    console.log('Received POST request to /visit');
  
    const { date, companies, worker: workerName } = req.body; // Updated destructuring
    console.log('Received data:', { date, companies, worker });
    worker = workerName; // Set the global worker variable

    const visitDate = new Date(date);

    if (isNaN(visitDate.getTime())) {
        console.error('Invalid date format:', date);
        return res.status(400).send('Invalid date format');
    }

    const filename = `${visitDate.getMonth() + 1}_${visitDate.getDate()}_${worker}.xlsx`;

    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Visits');

    worksheet.columns = [
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Day', key: 'dayName', width: 15 },
        { header: 'company_code', key: 'code', width: 15 },
        { header: 'company_name', key: 'name', width: 30 },
        { header: 'Notes', key: 'Notes', width: 45 },
        { header: 'startWork', key: 'startWork', width: 15 },
        { header: 'endWork', key: 'endWork', width: 15 }
    ];

    companies.forEach((company) => {
        worksheet.addRow({
            date: getFormattedDate(visitDate),
            dayName: visitDate.toLocaleDateString('en-US', { weekday: 'long' }),
            code: company.code,
            name: company.name,
            Notes: company.Notes,
            startWork: company.startWork,
            endWork: company.endWork
        });
    });

    workbook.xlsx.writeFile(filename)
        .then(() => {
            console.log(`Excel file '${filename}' generated successfully for visits`);
            res.status(200).send(`Excel file '${filename}' generated successfully for visits`);
        })
        .catch(err => {
            console.error('Error generating Excel file for visits:', err);
            res.status(500).send('Error generating Excel file for visits');
        });
});


// Route handler to add current date and day to the Excel file for no work
app.post('/no-work', (req, res) => {
    console.log('Received POST request for no work');

    const { date, worker } = req.body;
    console.log('Received data:', { date, worker });
    const noWorkDate = new Date(date);

    if (isNaN(noWorkDate.getTime())) {
        console.error('Invalid date format:', date);
        return res.status(400).send('Invalid date format');
    }

    const filename = `${noWorkDate.getMonth() + 1}_${noWorkDate.getDate()}_${worker}.xlsx`;

    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('No Work');

    // Add column headers
    worksheet.columns = [
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Day', key: 'dayName', width: 15 },
        { header: 'Worker', key: 'worker', width: 20 }
    ];

    // Add current date and day to the Excel file
    worksheet.addRow({
        date: getFormattedDate(noWorkDate), // Format date as MONTH/DAY
        dayName: noWorkDate.toLocaleDateString('en-US', { weekday: 'long' }), // Get day name
        worker: worker
    });
    worksheet.addRow({ date: 'Not going to work today', dayName: '', worker: '' });

    // Save the Excel file
    workbook.xlsx.writeFile(filename)
        .then(() => {
            console.log(`Excel file '${filename}' generated successfully for no work`);
            res.status(200).send(`Excel file '${filename}' generated successfully for no work`);
        })
        .catch(err => {
            console.error('Error generating Excel file for no work:', err);
            res.status(500).send('Error generating Excel file for no work');
        });
});


const watchDir = __dirname;  // This will make the watchDir the current directory

// Set up the file watcher
const watcher = chokidar.watch(watchDir, {
    ignored: [
        path.join(__dirname, 'data_excel/citys.xlsx'),
        path.join(__dirname, 'data_excel/locations.xlsx'),
        path.join(__dirname, 'data_excel/total.xlsx'),
        /^\./  // Ignore hidden files
    ],
    persistent: true
});

// Event: file added
watcher.on('add', (filePath) => {
    if (filePath.endsWith('.xlsx')) {  // Check if it's an Excel file
        console.log(`New Excel file detected: ${filePath}`);

        // Send email with the file attached
        sendEmail(filePath);
    }
});

function sendEmail(filePath) {
    const fileName = path.basename(filePath);
    const currentDate = new Date().toLocaleDateString();
    
    const mailOptions = {
        from: worker,
        to: receiver_email,
        subject: `New Excel Report Generated - ${worker}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Jaber Drug Store Report</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        margin: 0;
                        padding: 0;
                        background-color: #f5f5f5;
                    }
                    .email-container {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #ffffff;
                    }
                    .header {
                        background-color: #1a5f7a;
                        color: white;
                        padding: 20px;
                        text-align: center;
                        border-radius: 5px 5px 0 0;
                    }
                    .content {
                        padding: 20px;
                        background-color: #ffffff;
                        border-left: 1px solid #e0e0e0;
                        border-right: 1px solid #e0e0e0;
                    }
                    .footer {
                        background-color: #f8f9fa;
                        padding: 15px;
                        text-align: center;
                        font-size: 12px;
                        color: #666;
                        border-radius: 0 0 5px 5px;
                        border: 1px solid #e0e0e0;
                    }
                    .logo {
                        max-width: 150px;
                        height: auto;
                        margin-bottom: 10px;
                    }
                    .attachment-info {
                        background-color: #f8f9fa;
                        border: 1px solid #e0e0e0;
                        padding: 10px;
                        margin: 15px 0;
                        border-radius: 4px;
                    }
                    .signature {
                        margin-top: 20px;
                        padding-top: 15px;
                        border-top: 1px solid #e0e0e0;
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="header">
                        <h1>Jaber Drug Store</h1>
                    </div>
                    <div class="content">
                        <p>Dear Mr. Mari,</p>
                        <p>A new Excel report has been generated and is ready for your review.</p>
                        
                        <div class="attachment-info">
                            <p>📎 Attached File: ${fileName}</p>
                            <p>📅 Generated Date: ${currentDate}</p>
                        </div>
                        
                        <div class="signature">
                            <p>Best regards,<br>
                            ${employee_name}<br>
                            Jaber Drug Store</p>
                        </div>
                    </div>
                    <div class="footer">
                        <p>This is an automated message from Jaber Drug Store's reporting system</p>
                    </div>
                </div>
            </body>
            </html>
        `,
        attachments: [{
            path: filePath,
            filename: fileName
        }]
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error('Error sending email:', err);
        } else {
            console.log('Email sent successfully:', info.response);
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Error deleting file:', err);
                } else {
                    console.log(`File ${filePath} deleted successfully`);
                }
            });
        }
    });
}




console.log('Watching for new Excel files...');

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
  