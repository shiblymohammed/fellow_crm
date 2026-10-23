"use client";

import React, { useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'react-hot-toast';

export default function IntegrationsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'sheets' | 'forms' | 'website'>('sheets');

  const webhookUrl = typeof window !== 'undefined'
    ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/webhooks/leads/${user?.tenantId || 'YOUR_TENANT_ID'}`
    : '';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const codeSnippets = {
    sheets: `// Go to Extensions > Apps Script in your Google Sheet
function syncLeadsAutomatically() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  // Start from row 2 (skipping header)
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const name = String(row[0] || "").trim();
    const phone = String(row[1] || "").trim();
    const email = String(row[2] || "").trim();
    const destination = String(row[3] || "").trim();
    const status = String(row[4] || "").trim();
    
    // If Name and Phone exist, and it hasn't been synced yet
    if (name && phone && status !== "Synced ✓") {
      const payload = {
        customerName: name,
        customerPhone: phone,
        customerEmail: email,
        destination: destination,
        source: "google"
      };

      const options = {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(payload)
      };

      try {
        UrlFetchApp.fetch("${webhookUrl}", options);
        // Mark as Synced in column E
        sheet.getRange(i + 1, 5).setValue("Synced ✓");
      } catch(e) {
        sheet.getRange(i + 1, 5).setValue("Error");
      }
    }
  }
}`,
    forms: `// Go to Script Editor in Google Forms
function onSubmit(e) {
  const responses = e.response.getItemResponses();
  const payload = { source: "google" };
  
  responses.forEach(r => {
    const question = r.getItem().getTitle().toLowerCase();
    const answer = String(r.getResponse() || "");
    
    if (question.includes("name")) payload.customerName = answer;
    if (question.includes("phone")) payload.customerPhone = answer;
    if (question.includes("email")) payload.customerEmail = answer;
    if (question.includes("destination")) payload.destination = answer;
  });

  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload)
  };

  UrlFetchApp.fetch("${webhookUrl}", options);
}`,
    website: `<!-- Embed this form directly on your website -->
<form id="fellow-crm-form">
  <input type="text" name="customerName" placeholder="Name" required />
  <input type="tel" name="customerPhone" placeholder="Phone" required />
  <input type="email" name="customerEmail" placeholder="Email" />
  <input type="text" name="destination" placeholder="Where do you want to go?" />
  <input type="hidden" name="source" value="website" />
  <button type="submit">Get Quote</button>
</form>

<script>
document.getElementById('fellow-crm-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());
  
  fetch('${webhookUrl}', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .then(data => alert('Thank you! We will contact you soon.'))
  .catch(err => alert('Error submitting form.'));
});
</script>`
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl p-6 rounded-3xl border border-white/50 dark:border-gray-700/50 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white text-2xl shadow-lg">
            🔗
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Lead Integrations</h1>
            <p className="text-gray-500 text-sm mt-0.5">Automatically capture leads from external sources directly into your CRM pipeline.</p>
          </div>
        </div>
      </div>

      {/* Webhook URL section */}
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-6 rounded-3xl border border-white/50 dark:border-gray-700/50 shadow-md">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Your Unique Webhook URL</h2>
        <p className="text-sm text-gray-500 mb-4">Send POST requests with a JSON payload to this URL to create leads.</p>
        
        <div className="flex items-center gap-3">
          <code className="flex-1 p-3 bg-gray-100 dark:bg-gray-900 rounded-xl text-sm font-mono text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-800 overflow-hidden text-ellipsis whitespace-nowrap">
            {webhookUrl}
          </code>
          <button 
            onClick={() => copyToClipboard(webhookUrl)}
            className="px-4 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-colors shrink-0"
          >
            Copy URL
          </button>
        </div>
      </div>

      {/* Field Mapping Table */}
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-6 rounded-3xl border border-white/50 dark:border-gray-700/50 shadow-md overflow-x-auto">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Supported Data Fields</h2>
        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
          <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300">
            <tr>
              <th className="p-3 rounded-tl-xl font-bold">Field Name</th>
              <th className="p-3 font-bold">Type</th>
              <th className="p-3 font-bold">Requirement</th>
              <th className="p-3 rounded-tr-xl font-bold">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            <tr>
              <td className="p-3 font-mono text-gray-900 dark:text-white">customerName</td>
              <td className="p-3">String</td>
              <td className="p-3"><span className="text-red-500 font-bold">Required</span></td>
              <td className="p-3">Full name of the lead</td>
            </tr>
            <tr>
              <td className="p-3 font-mono text-gray-900 dark:text-white">customerPhone</td>
              <td className="p-3">String</td>
              <td className="p-3"><span className="text-red-500 font-bold">Required</span></td>
              <td className="p-3">Contact number (with country code preferred)</td>
            </tr>
            <tr>
              <td className="p-3 font-mono">customerEmail</td>
              <td className="p-3">String</td>
              <td className="p-3 text-gray-400">Optional</td>
              <td className="p-3">Email address</td>
            </tr>
            <tr>
              <td className="p-3 font-mono">destination</td>
              <td className="p-3">String</td>
              <td className="p-3 text-gray-400">Optional</td>
              <td className="p-3">Where they want to travel</td>
            </tr>
            <tr>
              <td className="p-3 font-mono">travelDate</td>
              <td className="p-3">YYYY-MM-DD</td>
              <td className="p-3 text-gray-400">Optional</td>
              <td className="p-3">Expected departure date</td>
            </tr>
            <tr>
              <td className="p-3 font-mono">adults, children</td>
              <td className="p-3">Number</td>
              <td className="p-3 text-gray-400">Optional</td>
              <td className="p-3">Number of travelers in each category</td>
            </tr>
            <tr>
              <td className="p-3 font-mono">source</td>
              <td className="p-3">String</td>
              <td className="p-3 text-gray-400">Optional</td>
              <td className="p-3">e.g., "google", "website"</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button 
          onClick={() => setActiveTab('sheets')}
          className={`px-6 py-3 rounded-2xl font-bold transition-all ${activeTab === 'sheets' ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
        >
          Google Sheets
        </button>
        <button 
          onClick={() => setActiveTab('forms')}
          className={`px-6 py-3 rounded-2xl font-bold transition-all ${activeTab === 'forms' ? 'bg-purple-500 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
        >
          Google Forms
        </button>
        <button 
          onClick={() => setActiveTab('website')}
          className={`px-6 py-3 rounded-2xl font-bold transition-all ${activeTab === 'website' ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
        >
          Website Forms
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-6 rounded-3xl border border-white/50 dark:border-gray-700/50 shadow-md">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
            {activeTab.replace('-', ' ')} Integration
          </h2>
          <div className="text-sm text-gray-700 dark:text-gray-300 mt-4 mb-6 space-y-4">
            {activeTab === 'sheets' && (
              <ul className="list-decimal pl-5 space-y-2">
                <li><strong>Set up your Sheet:</strong> Create a new Google Sheet. In Row 1, set up the headers exactly like this:
                  <ul className="list-disc pl-5 mt-1 text-gray-500">
                    <li><strong>A1:</strong> Name</li>
                    <li><strong>B1:</strong> Phone</li>
                    <li><strong>C1:</strong> Email</li>
                    <li><strong>D1:</strong> Destination</li>
                    <li><strong>E1:</strong> Status</li>
                  </ul>
                </li>
                <li><strong>Open Script Editor:</strong> In the Google Sheets top menu, click <em>Extensions &gt; Apps Script</em>.</li>
                <li><strong>Add Code:</strong> Delete any default code, and paste the automatic sync script provided below.</li>
                <li><strong>Add a Time Trigger:</strong> On the left menu of the script editor, click the <strong>Triggers (Clock icon)</strong>. Click "Add Trigger". Under "Select event source", choose <strong>Time-driven</strong>. Choose <strong>Minutes timer</strong> and <strong>Every minute</strong>. Click Save.</li>
                <li><strong>You're done!</strong> Whenever you paste or type leads into the sheet (with at least a Name and Phone), the script will automatically push them to the CRM within 60 seconds and mark Column E as "Synced ✓".</li>
              </ul>
            )}
            {activeTab === 'forms' && (
              <ul className="list-decimal pl-5 space-y-2">
                <li><strong>Create the Form:</strong> Create a new Google Form.</li>
                <li><strong>Add Questions:</strong> Add the following exact question titles (casing matters!):
                  <ul className="list-disc pl-5 mt-1 text-gray-500">
                    <li>Question 1: <code>Name</code> (Short answer, <strong>Required</strong>)</li>
                    <li>Question 2: <code>Phone</code> (Short answer, <strong>Required</strong>)</li>
                    <li>Question 3: <code>Email</code> (Short answer)</li>
                    <li>Question 4: <code>Destination</code> (Short answer)</li>
                  </ul>
                </li>
                <li><strong>Open Script Editor:</strong> Click the <strong>3 vertical dots</strong> in the top-right corner of Google Forms, then click <em>Script editor</em>.</li>
                <li><strong>Add Code:</strong> Paste the code snippet below and click Save.</li>
                <li><strong>Add a Trigger:</strong> This is critical! On the left menu of the script editor, click the <strong>Triggers (Clock icon)</strong>. Click "Add Trigger" (bottom right). Change "Select event type" to <strong>On form submit</strong>. Click Save and allow permissions.</li>
              </ul>
            )}
            {activeTab === 'website' && (
              <ul className="list-decimal pl-5 space-y-2">
                <li><strong>Embed HTML:</strong> Copy the HTML structure from the snippet below and paste it into your website builder (WordPress, Webflow, Shopify, or raw HTML).</li>
                <li><strong>Match Field Names:</strong> If you add more fields, make sure the <code>name="..."</code> tags on your inputs match the <em>Supported Data Fields</em> table exactly (e.g., <code>name="adults"</code>).</li>
                <li><strong>Javascript Setup:</strong> Place the JavaScript snippet immediately after the form. This script will automatically capture the form submission, prevent the page from reloading, and securely send the lead to your CRM in the background.</li>
              </ul>
            )}
          </div>
        </div>

        <div className="relative group">
          <div className="absolute right-4 top-4">
            <button 
              onClick={() => copyToClipboard(codeSnippets[activeTab])}
              className="px-3 py-1.5 bg-gray-700/50 hover:bg-gray-700 text-white text-xs font-bold rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            >
              Copy Code
            </button>
          </div>
          <pre className="p-4 bg-gray-900 text-gray-100 rounded-2xl overflow-x-auto text-sm font-mono leading-relaxed">
            <code>{codeSnippets[activeTab]}</code>
          </pre>
        </div>
        
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/50 rounded-xl text-yellow-800 dark:text-yellow-200 text-sm">
          <strong>Note:</strong> Ensure you send at least <code>customerName</code> and <code>customerPhone</code> in your payload. Both are required to automatically create the lead.
        </div>
      </div>
    </div>
  );
}
