"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

/**
 * LedgerTab component - Shows transaction ledger information
 * Displays all financial transactions with filtering capabilities
 */
export function LedgerTab() {
  return (
    <>
      {/* Bank Balance Widgets */}
      <div className="mb-4">
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Poynts Bank Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$888,000</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Source A Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$164,344</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Source B Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$119,068</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Source C Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$133,972</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="yesterday">Yesterday</SelectItem>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="quarter">This quarter</SelectItem>
            <SelectItem value="year">This year</SelectItem>
            <SelectItem value="custom">Custom range</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="transfer">Transfer</SelectItem>
            <SelectItem value="rebate">Rebate</SelectItem>
            <SelectItem value="deposit">Deposit</SelectItem>
            <SelectItem value="withdrawal">Withdrawal</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger>
            <SelectValue placeholder="From Bank" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All banks</SelectItem>
            <SelectItem value="poynts">Poynts Bank</SelectItem>
            <SelectItem value="sourceA">Source A</SelectItem>
            <SelectItem value="sourceB">Source B</SelectItem>
            <SelectItem value="sourceC">Source C</SelectItem>
            <SelectItem value="customer">Customer Deposit</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger>
            <SelectValue placeholder="To Bank" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All banks</SelectItem>
            <SelectItem value="poynts">Poynts Bank</SelectItem>
            <SelectItem value="sourceA">Source A Poynts Bank</SelectItem>
            <SelectItem value="sourceB">Source B Poynts Bank</SelectItem>
            <SelectItem value="sourceC">Source C Poynts Bank</SelectItem>
            <SelectItem value="rebateA">Source A Rebate Bank</SelectItem>
            <SelectItem value="rebateB">Source B Rebate Bank</SelectItem>
            <SelectItem value="rebateC">Source C Rebate Bank</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Ledger</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Initiated At</TableHead>
                <TableHead>Completed At</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>From Bank</TableHead>
                <TableHead>To Bank</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Transaction data rows based on screenshot */}
              <TableRow>
                <TableCell>TRANSFER</TableCell>
                <TableCell>Nov 07, 2024, 11:01:00AM</TableCell>
                <TableCell>Nov 7, 2024, 11:01:00AM</TableCell>
                <TableCell>$50,000.00</TableCell>
                <TableCell>Poynts Bank</TableCell>
                <TableCell>Source C Poynts Bank</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>TRANSFER</TableCell>
                <TableCell>Nov 07, 2024, 11:00:00AM</TableCell>
                <TableCell>Nov 7, 2024, 11:00:00AM</TableCell>
                <TableCell>$50,000.00</TableCell>
                <TableCell>Poynts Bank</TableCell>
                <TableCell>Source B Rebate Bank</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>TRANSFER</TableCell>
                <TableCell>Nov 07, 2024, 10:58:00AM</TableCell>
                <TableCell>Nov 7, 2024, 10:58:00AM</TableCell>
                <TableCell>$150,000.00</TableCell>
                <TableCell>Poynts Bank</TableCell>
                <TableCell>Source A Poynts Bank</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>TRANSFER</TableCell>
                <TableCell>Nov 01, 2024, 9:30:00AM</TableCell>
                <TableCell>Nov 1, 2024, 9:30:00AM</TableCell>
                <TableCell>$50,000.00</TableCell>
                <TableCell>Poynts Bank</TableCell>
                <TableCell>Source C Poynts Bank</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>TRANSFER</TableCell>
                <TableCell>Nov 01, 2024, 9:29:00AM</TableCell>
                <TableCell>Nov 1, 2024, 9:29:00AM</TableCell>
                <TableCell>$50,000.00</TableCell>
                <TableCell>Poynts Bank</TableCell>
                <TableCell>Source B Poynts Bank</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>TRANSFER</TableCell>
                <TableCell>Nov 01, 2024, 9:27:00AM</TableCell>
                <TableCell>Nov 1, 2024, 9:27:00AM</TableCell>
                <TableCell>$150,000.00</TableCell>
                <TableCell>Poynts Bank</TableCell>
                <TableCell>Source A Poynts Bank</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>TRANSFER</TableCell>
                <TableCell>Nov 01, 2024, 8:00:00AM</TableCell>
                <TableCell>Nov 1, 2024, 8:00:00AM</TableCell>
                <TableCell>$1,000,000.00</TableCell>
                <TableCell>Customer Deposit</TableCell>
                <TableCell>Poynts Bank</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>REBATE</TableCell>
                <TableCell>Oct 31, 2024, 11:50:00AM</TableCell>
                <TableCell>Oct 31, 2024, 11:50:00AM</TableCell>
                <TableCell>$733.50</TableCell>
                <TableCell>Source B Accum. Rebate</TableCell>
                <TableCell>Source B Poynts Bank</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>REBATE</TableCell>
                <TableCell>Oct 31, 2024, 11:50:00AM</TableCell>
                <TableCell>Oct 31, 2024, 11:50:00AM</TableCell>
                <TableCell>$10,957.10</TableCell>
                <TableCell>Source A Accum. Rebate</TableCell>
                <TableCell>Source A Rebate Bank</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>REBATE</TableCell>
                <TableCell>Oct 31, 2024, 11:50:00AM</TableCell>
                <TableCell>Oct 31, 2024, 11:50:00AM</TableCell>
                <TableCell>$6,318.40</TableCell>
                <TableCell>Source C Accum. Rebate</TableCell>
                <TableCell>Source C Rebate Bank</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
