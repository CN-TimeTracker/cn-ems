'use client';

import React from 'react';

interface PayslipDocumentProps {
  data: {
    employee: {
      name: string;
      code: string;
      bankName: string;
      accountNo: string;
      designation: string;
      doj: string;
      epfUan: string;
      esic: string;
    };
    period: {
      month: string;
      year: string;
    };
    earnings: {
      basic: number;
      hra: number;
      conveyance: number;
      leave: number;
      grossSalary: number;
      employerContribution: number;
      ctc: number;
    };
    deductions: {
      epf: number;
      esi: number;
      pt: number;
      leave: number;
      insurance: number;
      tds: number;
      totalDeduction: number;
      takeHome: number;
    };
    meta: {
      salaryForDays: number;
      lop: number;
      rawLop: number;
      lopDeduction: number;
      baseGross: number;
    }
  };
}

export default function PayslipDocument({ data }: PayslipDocumentProps) {
  if (!data) return null;

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto text-gray-800 font-sans payslip-container" id="printable-payslip">
      {/* Header */}
      <div className="flex justify-between items-start border-b-0 pb-4 mb-4">
        <div className="flex items-center gap-2">
           <div className="flex flex-col">
              <span className="text-3xl font-black tracking-tighter text-orange-600">CODE<span className="text-[#0D1B3E]">NEPTUNE</span></span>
           </div>
        </div>
        <div className="text-right text-[10px] text-gray-600">
          <p className="font-bold text-[#3B82F6]">CODE NEPTUNE TECHNOLOGIES PRIVATE LIMITED</p>
          <p>KHIVRAJ RAJ, No 624, 3RD Floor,</p>
          <p>THOUSAND LIGHTS,</p>
          <p>Chennai - 600097.</p>
        </div>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-lg font-bold text-[#3B82F6] underline uppercase decoration-1 underline-offset-4">
          PAYSLIP FOR THE MONTH OF {data.period.month} {data.period.year}
        </h2>
      </div>

      {/* Info Table */}
      <table className="w-full border-collapse border border-gray-300 text-[11px] mb-6">
        <tbody>
          <tr>
            <td className="border border-gray-300 p-2 font-bold bg-[#F9FAFB] w-1/4">EMPLOYEE NAME:</td>
            <td className="border border-gray-300 p-2 w-1/4 uppercase">{data.employee.name}</td>
            <td className="border border-gray-300 p-2 font-bold bg-[#F9FAFB] w-1/4">EMP CODE:</td>
            <td className="border border-gray-300 p-2 w-1/4 uppercase">{data.employee.code}</td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-2 font-bold bg-[#F9FAFB]">BANK AC NUMBER:</td>
            <td className="border border-gray-300 p-2">{data.employee.accountNo}</td>
            <td className="border border-gray-300 p-2 font-bold bg-[#F9FAFB]">BANK NAME:</td>
            <td className="border border-gray-300 p-2">{data.employee.bankName}</td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-2 font-bold bg-[#F9FAFB]">EPF-UAN:</td>
            <td className="border border-gray-300 p-2">{data.employee.epfUan}</td>
            <td className="border border-gray-300 p-2 font-bold bg-[#F9FAFB]">ESIC :</td>
            <td className="border border-gray-300 p-2">{data.employee.esic}</td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-2 font-bold bg-[#F9FAFB]">DESIGNATION:</td>
            <td className="border border-gray-300 p-2">{data.employee.designation}</td>
            <td className="border border-gray-300 p-2 font-bold bg-[#F9FAFB]">DATE OF JOINING:</td>
            <td className="border border-gray-300 p-2">{data.employee.doj}</td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-2 font-bold bg-[#F9FAFB]">CTC:</td>
            <td className="border border-gray-300 p-2">{data.earnings.ctc}</td>
            <td className="border border-gray-300 p-2 font-bold bg-[#F9FAFB]">SALARY:</td>
            <td className="border border-gray-300 p-2">{data.earnings.grossSalary}</td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-2 font-bold bg-[#F9FAFB]">SALARY FOR DAYS:</td>
            <td className="border border-gray-300 p-2">{data.meta.salaryForDays}</td>
            <td className="border border-gray-300 p-2 font-bold bg-[#F9FAFB]">LOP :</td>
            <td className="border border-gray-300 p-2">{data.meta.lop}</td>
          </tr>
        </tbody>
      </table>

      {/* Earnings/Deductions Tables */}
      <div className="grid grid-cols-2 gap-0 border border-gray-300">
        {/* Earnings */}
        <div className="border-r border-gray-300">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-[#4B5563] text-white">
                <th className="p-2 text-left w-2/3 border-b border-gray-300 uppercase">Earnings</th>
                <th className="p-2 text-right w-1/3 border-b border-gray-300 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border-b border-gray-200 font-bold">Basic & DA</td>
                <td className="p-2 border-b border-gray-200 text-right font-bold">{data.earnings.basic}</td>
              </tr>
              <tr>
                <td className="p-2 border-b border-gray-200 font-bold">HRA</td>
                <td className="p-2 border-b border-gray-200 text-right font-bold">{data.earnings.hra}</td>
              </tr>
              <tr className={data.meta.lopDeduction > 0 ? "text-red-600 bg-red-50/10" : "opacity-30"}>
                <td className="p-2 border-b border-gray-200 font-bold italic">LOP Deduction ({data.meta.lop} days)</td>
                <td className="p-2 border-b border-gray-200 text-right font-bold">{data.meta.lopDeduction > 0 ? `-${data.meta.lopDeduction}` : '0'}</td>
              </tr>
              <tr>
                <td className="p-2 border-b border-gray-200 font-bold">Conveyance</td>
                <td className="p-2 border-b border-gray-200 text-right font-bold">{data.earnings.conveyance}</td>
              </tr>
              <tr>
                <td className="p-2 border-b border-gray-200 font-bold">Medical Allowance</td>
                <td className="p-2 border-b border-gray-200 text-right font-bold">0</td>
              </tr>
              <tr>
                <td className="p-2 border-b border-gray-200 font-bold">Special Allowance</td>
                <td className="p-2 border-b border-gray-200 text-right font-bold">0</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="p-2 font-bold text-[11px] uppercase">Net Gross Salary</td>
                <td className="p-2 text-right font-bold text-[11px]">{data.earnings.grossSalary}</td>
              </tr>
              <tr>
                <td className="p-2 border-t border-gray-200 font-bold">Employer Contribution</td>
                <td className="p-2 border-t border-gray-200 text-right font-bold">{data.earnings.employerContribution}</td>
              </tr>
              <tr className="bg-[#4B5563] text-white">
                <td className="p-2 font-bold text-[12px] uppercase tracking-wider">Cost to Company (CTC)</td>
                <td className="p-2 text-right font-bold text-[12px]">{data.earnings.ctc}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Deductions */}
        <div>
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-[#4B5563] text-white">
                <th className="p-2 text-left w-2/3 border-b border-gray-300 uppercase">Deductions</th>
                <th className="p-2 text-right w-1/3 border-b border-gray-300 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border-b border-gray-200 font-bold">EPF Contribution</td>
                <td className="p-2 border-b border-gray-200 text-right font-bold">{data.deductions.epf}</td>
              </tr>
              <tr>
                <td className="p-2 border-b border-gray-200 font-bold">E.S.I.</td>
                <td className="p-2 border-b border-gray-200 text-right font-bold">{data.deductions.esi}</td>
              </tr>
              <tr>
                <td className="p-2 border-b border-gray-200 font-bold">Professional Tax (PT)</td>
                <td className="p-2 border-b border-gray-200 text-right font-bold">{data.deductions.pt || 208}</td>
              </tr>
              <tr>
                <td className="p-2 border-b border-gray-200 font-bold">Leaves (LOP Units)</td>
                <td className="p-2 border-b border-gray-200 text-right font-bold">{data.meta.rawLop}</td>
              </tr>
              <tr>
                <td className="p-2 border-b border-gray-200 font-bold">Insurance</td>
                <td className="p-2 border-b border-gray-200 text-right font-bold">{data.deductions.insurance}</td>
              </tr>
              <tr>
                <td className="p-2 border-b border-gray-200 font-bold">Income Tax (TDS)</td>
                <td className="p-2 border-b border-gray-200 text-right font-bold">{data.deductions.tds}</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="p-2 font-bold text-[11px] uppercase">Total Deduction</td>
                <td className="p-2 text-right font-bold text-[11px]">{data.deductions.totalDeduction}</td>
              </tr>
              <tr>
                <td className="p-2 border-t border-gray-200 font-bold">Net Payable Days</td>
                <td className="p-2 border-t border-gray-200 text-right font-bold">{data.meta.salaryForDays - data.meta.lop}</td>
              </tr>
              <tr className="bg-[#4B5563] text-white">
                <td className="p-2 font-bold text-[12px] uppercase tracking-wider">Net Take Home Pay</td>
                <td className="p-2 text-right font-bold text-[12px]">{data.deductions.takeHome}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-[10px] text-gray-600 leading-relaxed font-medium">
        <p className="font-bold mb-1">Note:</p>
        <p>This is computer generated statement and no signature is required. This information is confidential and meant for your reference only. It should not be shared with any employee of Team Tweaks or group companies. In case it comes to the attention of the management that this confidentiality is not maintained, it will be viewed seriously and will be treated as a breach of organization policy and the employee is liable for strict disciplinary action.</p>
      </div>

      <style jsx global>{`
        @media screen {
          .print-only { display: none !important; }
        }
        @media print {
          body * {
            visibility: hidden !important;
          }
          .print-only, .print-only * {
            visibility: visible !important;
          }
          .print-only {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          #printable-payslip {
            padding: 15mm !important;
            background: white !important;
          }
          table { width: 100% !important; border-collapse: collapse !important; }
          td, th { border: 1px solid #ddd !important; }
          .bg-gray-50, .bg-[#F9FAFB] { background-color: #f9fafb !important; -webkit-print-color-adjust: exact; }
          .bg-[#4B5563] { background-color: #4b5563 !important; -webkit-print-color-adjust: exact; }
          .text-white { color: white !important; -webkit-print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}
