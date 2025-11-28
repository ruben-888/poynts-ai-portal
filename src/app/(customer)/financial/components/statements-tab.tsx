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
import { FileIcon, Download } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * StatementsTab component - Shows the closing statements information
 * Extracted from the FinancialDashboard for better customization
 */
export function StatementsTab() {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Closing Statements
          </h2>
          <p className="text-sm text-muted-foreground">
            Statement Closing - March 31, 2025
          </p>
        </div>
        <div className="flex items-end gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground mb-1">
              Statement Period
            </span>
            <Select defaultValue="march-2025">
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="march-2025">March 2025</SelectItem>
                <SelectItem value="february-2025">February 2025</SelectItem>
                <SelectItem value="january-2025">January 2025</SelectItem>
                <SelectItem value="december-2024">December 2024</SelectItem>
                <SelectItem value="november-2024">November 2024</SelectItem>
                <SelectItem value="october-2024">October 2024</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <FileIcon className="h-4 w-4 mr-2" />
              Download PDF
            </Button>

            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download CSV
            </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-4 flex-col lg:flex-row">
        {/* Statement Summary Column - Fixed width */}
        <Card className="w-[500px] flex-shrink-0">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Summary</TableHead>
                  <TableHead>Bank Letter</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">1. Openings</TableCell>
                  <TableCell>A</TableCell>
                  <TableCell className="text-right">$104,047.72</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>B</TableCell>
                  <TableCell className="text-right">$153,784.24</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>C</TableCell>
                  <TableCell className="text-right">$66,191.87</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>PB</TableCell>
                  <TableCell className="text-right">$938,000</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">2. Funding</TableCell>
                  <TableCell>PB</TableCell>
                  <TableCell className="text-right">$1,000,000</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">3. Transfers</TableCell>
                  <TableCell>A</TableCell>
                  <TableCell className="text-right">$650,000</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>B</TableCell>
                  <TableCell className="text-right">$200,000</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>C</TableCell>
                  <TableCell className="text-right">$250,000</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">4. Transactions</TableCell>
                  <TableCell>A</TableCell>
                  <TableCell className="text-right">$730,135</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>B</TableCell>
                  <TableCell className="text-right">$216,755</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>C</TableCell>
                  <TableCell className="text-right">$352,685</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    5. Closing (Before Rebates)
                  </TableCell>
                  <TableCell>A</TableCell>
                  <TableCell className="text-right">$23,912.72</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>B</TableCell>
                  <TableCell className="text-right">$137,029.24</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>C</TableCell>
                  <TableCell className="text-right">-$36,493.13</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>PB</TableCell>
                  <TableCell className="text-right">$838,000</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">6. Rebates</TableCell>
                  <TableCell>A</TableCell>
                  <TableCell className="text-right">$9,126.69</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>B</TableCell>
                  <TableCell className="text-right">$1,083.78</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>C</TableCell>
                  <TableCell className="text-right">$6,500.69</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    7. Closing (After Rebates)
                  </TableCell>
                  <TableCell>A</TableCell>
                  <TableCell className="text-right">$33,039.41</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>B</TableCell>
                  <TableCell className="text-right">$138,113.02</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>C</TableCell>
                  <TableCell className="text-right">-$29,992.44</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>PB</TableCell>
                  <TableCell className="text-right">$838,000</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Right column with the three tables */}
        <div className="flex-grow space-y-4">
          {/* Funding Deposits */}
          <Card>
            <CardHeader>
              <CardTitle>Funding Deposits</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Entry Type</TableHead>
                    <TableHead>To Bank</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Mar 6, 2025</TableCell>
                    <TableCell>Customer Deposit</TableCell>
                    <TableCell>Poynts Bank</TableCell>
                    <TableCell className="text-right">$1,000,000</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-medium">
                      Grand total
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      $1,000,000
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Transfers */}
          <Card>
            <CardHeader>
              <CardTitle>Transfers from Poynts Bank to Source Banks</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>From Bank</TableHead>
                    <TableHead>To Bank</TableHead>
                    <TableHead>Entry Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Mar 3, 2025</TableCell>
                    <TableCell>Poynts Bank</TableCell>
                    <TableCell>Source A Poynts Bank</TableCell>
                    <TableCell>Poynts Transfer</TableCell>
                    <TableCell className="text-right">$100,000</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Mar 3, 2025</TableCell>
                    <TableCell>Poynts Bank</TableCell>
                    <TableCell>Source B Poynts Bank</TableCell>
                    <TableCell>Poynts Transfer</TableCell>
                    <TableCell className="text-right">$50,000</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Mar 6, 2025</TableCell>
                    <TableCell>Poynts Bank</TableCell>
                    <TableCell>Source B Poynts Bank</TableCell>
                    <TableCell>Poynts Transfer</TableCell>
                    <TableCell className="text-right">$50,000</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Mar 6, 2025</TableCell>
                    <TableCell>Poynts Bank</TableCell>
                    <TableCell>Source A Poynts Bank</TableCell>
                    <TableCell>Poynts Transfer</TableCell>
                    <TableCell className="text-right">$100,000</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Mar 6, 2025</TableCell>
                    <TableCell>Poynts Bank</TableCell>
                    <TableCell>Source C Poynts Bank</TableCell>
                    <TableCell>Poynts Transfer</TableCell>
                    <TableCell className="text-right">$100,000</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={4} className="text-right font-medium">
                      Grand total
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      $1,100,000
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Rebates */}
          <Card>
            <CardHeader>
              <CardTitle>Rebate Transfers to Source Banks</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>From Bank</TableHead>
                    <TableHead>To Bank</TableHead>
                    <TableHead>Entry Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Mar 31, 2025</TableCell>
                    <TableCell>Source C Accum. Rebate</TableCell>
                    <TableCell>Source C Poynts Bank</TableCell>
                    <TableCell>Rebate Deposit</TableCell>
                    <TableCell className="text-right">$6,500.69</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Mar 31, 2025</TableCell>
                    <TableCell>Source B Accum. Rebate</TableCell>
                    <TableCell>Source B Poynts Bank</TableCell>
                    <TableCell>Rebate Deposit</TableCell>
                    <TableCell className="text-right">$1,083.78</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Mar 31, 2025</TableCell>
                    <TableCell>Source A Accum. Rebate</TableCell>
                    <TableCell>Source A Poynts Bank</TableCell>
                    <TableCell>Rebate Deposit</TableCell>
                    <TableCell className="text-right">$9,126.69</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={4} className="text-right font-medium">
                      Grand total
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      $16,711.16
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
