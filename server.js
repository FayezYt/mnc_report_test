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


const PORT = process.env.PORT || 4455; // PORTS
const receiver_email = 'hodlondreamlife@gmail.com'; //mareeibrahim90@gmail.com
require('dotenv').config();  // Load environment variables from .env file
//const worker = 'Diea Mari';
let worker = ''; // Define the worker variable globally

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
  
    const { date, companies, worker: workerName } = req.body; // Extract worker from request body
    worker = workerName; // Assign the value to the global variable
    console.log('Received data:', { date, companies, worker });
    

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
    const currentDate = new Intl.DateTimeFormat('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date());
    
    const mailOptions = {
        from: `"مستودع جابر" <${worker}>`,
        to: receiver_email,
        subject: `تقرير إكسل جديد - ${worker}`,
        html: `
            <!DOCTYPE html>
            <html dir="rtl" lang="ar">
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>تقرير مستودع جابر</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Changa:wght@400;600&display=swap');
                    
                    body {
                        font-family: 'Changa', 'Cairo', sans-serif;
                        line-height: 2;
                        margin: 0;
                        padding: 0;
                        background-color: #f0f4f8;
                        direction: rtl;
                        font-size: 18px;
                    }
                    .email-container {
                        max-width: 700px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
                        border-radius: 20px;
                        overflow: hidden;
                    }
                    .header {
                        background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
                        color: white;
                        padding: 40px;
                        text-align: center;
                        position: relative;
                    }
                    .header::after {
                        content: '';
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        height: 12px;
                        background: linear-gradient(90deg, #e74c3c, #f39c12);
                    }
                    .logo-container {
                        text-align: center;
                        margin-bottom: 20px;
                    }
                    .logo {
                        width: 100px;
                        height: 100px;
                        border-radius: 50%;
                        border: 4px solid #fff;
                        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                    }
                    .header h1 {
                        font-size: 42px;
                        margin: 0;
                        font-family: 'Cairo', sans-serif;
                        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                    }
                    .content {
                        padding: 40px;
                        background-color: #ffffff;
                        font-size: 20px;
                    }
                    .worker-info {
                        background: linear-gradient(to left, #ecf0f1, #f9f9f9);
                        border-right: 6px solid #3498db;
                        padding: 20px;
                        margin: 25px 0;
                        border-radius: 0 12px 12px 0;
                    }
                    .attachment-info {
                        background: linear-gradient(to left, #e8f4f8, #ffffff);
                        border: 2px solid #3498db;
                        padding: 25px;
                        margin: 25px 0;
                        border-radius: 15px;
                        position: relative;
                    }
                    .attachment-info::before {
                        content: '📎';
                        font-size: 32px;
                        position: absolute;
                        right: -16px;
                        top: 50%;
                        transform: translateY(-50%);
                        background: #ffffff;
                        padding: 8px;
                        border-radius: 50%;
                        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
                    }
                    .signature {
                        margin-top: 35px;
                        padding-top: 25px;
                        border-top: 3px solid #ecf0f1;
                        text-align: left;
                        font-size: 22px;
                    }
                    .footer {
                        background: linear-gradient(to right, #2c3e50, #3498db);
                        padding: 25px;
                        text-align: center;
                        font-size: 16px;
                        color: #ffffff;
                        border-top: 4px solid #e74c3c;
                    }
                    .highlight {
                        color: #2c3e50;
                        font-weight: 600;
                        font-size: 24px;
                    }
                    .date-badge {
                        display: inline-block;
                        background: linear-gradient(to left, #3498db, #2980b9);
                        color: white;
                        padding: 8px 20px;
                        border-radius: 25px;
                        font-size: 18px;
                        margin: 15px 0;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    p {
                        margin: 15px 0;
                        font-size: 20px;
                    }
                    strong {
                        color: #2c3e50;
                        font-size: 22px;
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="header">
                        <div class="logo-container">
                            <img src="cid:company-logo" class="logo" alt="مستودع جابر">
                        </div>
                        <h1>مستودع جابر</h1>
                        <p style="font-size: 24px;">نظام التقارير الآلي</p>
                    </div>
                    <div class="content">
                        <p style="font-size: 24px;">السيد المحترم إبراهيم مرعي</p>
                        <p>نأمل أن تصلكم رسالتنا هذه وأنتم بأتم الصحة والعافية.</p>
                        
                        <div class="worker-info">
                            <p class="highlight">معلومات الموظف:</p>
                            <p>اسم الموظف: ${worker}</p>
                            <p>القسم: قسم التقارير</p>
                        </div>
                        
                        <div class="attachment-info">
                            <p class="highlight">تفاصيل التقرير:</p>
                            <p>اسم الملف: ${fileName}</p>
                            <div class="date-badge">
                                تاريخ الإنشاء: ${currentDate}
                            </div>
                        </div>
                        
                        <p>يرجى مراجعة التقرير المرفق في أقرب وقت ممكن.</p>
                        
                        <div class="signature">
                            <p>مع أطيب التحيات،<br>
                            <strong>${worker}</strong><br>
                            مستودع جابر</p>
                        </div>
                    </div>
                    <div class="footer">
                        <p>هذه رسالة آلية من نظام التقارير الخاص بمستودع جابر</p>
                        <p>© ${new Date().getFullYear()} مستودع جابر - جميع الحقوق محفوظة</p>
                    </div>
                </div>
            </body>
            </html>
        `,
        attachments: [
            {
                path: filePath,
                filename: fileName
            }
            ,
            {
                filename: 'noreva.ico',
                path: 'noreva.ico',
                cid: 'company-logo'
            }
        ]
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