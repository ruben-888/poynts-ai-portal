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
import { Button } from "@/components/ui/button";
import { Download, FileIcon } from "lucide-react";

/**
 * AccountingReportTab component - Shows month-by-month financial data
 * Displays financial data across multiple months for comparison
 */
export function AccountingReportTab() {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Accounting Report
          </h2>
          <p className="text-sm text-muted-foreground">
            Month-by-month financial statement comparison
          </p>
        </div>
        <div className="flex items-end gap-2">
          <Button variant="outline" size="sm">
            <FileIcon className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Month-by-month Accounting Report Table */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Financial Statement</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-background">
                  Operation
                </TableHead>
                <TableHead className="sticky left-[120px] bg-background">
                  Bank Letter
                </TableHead>
                <TableHead>Mar 31, 2025</TableHead>
                <TableHead>Feb 28, 2025</TableHead>
                <TableHead>Jan 31, 2025</TableHead>
                <TableHead>Dec 31, 2024</TableHead>
                <TableHead>Nov 30, 2024</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* 1. Openings */}
              <TableRow>
                <TableCell
                  className="font-medium sticky left-0 bg-background"
                  rowSpan={4}
                >
                  1. Openings
                </TableCell>
                <TableCell className="sticky left-[120px] bg-background">
                  A
                </TableCell>
                <TableCell>104,047.72</TableCell>
                <TableCell>200,053.34</TableCell>
                <TableCell>136,069.21</TableCell>
                <TableCell>128,772.81</TableCell>
                <TableCell>-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="sticky left-[120px] bg-background">
                  B
                </TableCell>
                <TableCell>153,784.24</TableCell>
                <TableCell>271,030.54</TableCell>
                <TableCell>238,309.44</TableCell>
                <TableCell>216,212.86</TableCell>
                <TableCell>-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="sticky left-[120px] bg-background">
                  C
                </TableCell>
                <TableCell>66,191.87</TableCell>
                <TableCell>110,630.13</TableCell>
                <TableCell>85,682.35</TableCell>
                <TableCell>79,962.01</TableCell>
                <TableCell>-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="sticky left-[120px] bg-background">
                  PB
                </TableCell>
                <TableCell>938,000</TableCell>
                <TableCell>763,000</TableCell>
                <TableCell>1,028,000</TableCell>
                <TableCell>178,000</TableCell>
                <TableCell>-</TableCell>
              </TableRow>

              {/* 2. Funding */}
              <TableRow>
                <TableCell className="font-medium sticky left-0 bg-background">
                  2. Funding
                </TableCell>
                <TableCell className="sticky left-[120px] bg-background">
                  PB
                </TableCell>
                <TableCell>1,000,000</TableCell>
                <TableCell>1,000,000</TableCell>
                <TableCell>1,000,000</TableCell>
                <TableCell>2,000,000</TableCell>
                <TableCell>-</TableCell>
              </TableRow>

              {/* 3. Transfers */}
              <TableRow>
                <TableCell
                  className="font-medium sticky left-0 bg-background"
                  rowSpan={3}
                >
                  3. Transfers
                </TableCell>
                <TableCell className="sticky left-[120px] bg-background">
                  A
                </TableCell>
                <TableCell>650,000</TableCell>
                <TableCell>500,000</TableCell>
                <TableCell>705,000</TableCell>
                <TableCell>650,000</TableCell>
                <TableCell>-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="sticky left-[120px] bg-background">
                  B
                </TableCell>
                <TableCell>200,000</TableCell>
                <TableCell>50,000</TableCell>
                <TableCell>205,000</TableCell>
                <TableCell>200,000</TableCell>
                <TableCell>-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="sticky left-[120px] bg-background">
                  C
                </TableCell>
                <TableCell>250,000</TableCell>
                <TableCell>275,000</TableCell>
                <TableCell>355,000</TableCell>
                <TableCell>300,000</TableCell>
                <TableCell>-</TableCell>
              </TableRow>

              {/* 4. Transactions */}
              <TableRow>
                <TableCell
                  className="font-medium sticky left-0 bg-background"
                  rowSpan={4}
                >
                  4. Transactions
                </TableCell>
                <TableCell className="sticky left-[120px] bg-background">
                  A
                </TableCell>
                <TableCell>730,135</TableCell>
                <TableCell>603,550</TableCell>
                <TableCell>649,130</TableCell>
                <TableCell>655,820</TableCell>
                <TableCell>-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="sticky left-[120px] bg-background">
                  B
                </TableCell>
                <TableCell>216,755</TableCell>
                <TableCell>168,065</TableCell>
                <TableCell>173,125</TableCell>
                <TableCell>178,790</TableCell>
                <TableCell>-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="sticky left-[120px] bg-background">
                  C
                </TableCell>
                <TableCell>352,685</TableCell>
                <TableCell>324,970</TableCell>
                <TableCell>335,300</TableCell>
                <TableCell>303,130</TableCell>
                <TableCell>-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="sticky left-[120px] bg-background">
                  O
                </TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
              </TableRow>

              {/* 5. Closing (Before Rebates) */}
              <TableRow>
                <TableCell
                  className="font-medium sticky left-0 bg-background"
                  rowSpan={4}
                >
                  5. Closing (Before Rebates)
                </TableCell>
                <TableCell className="sticky left-[120px] bg-background">
                  A
                </TableCell>
                <TableCell>23,912.72</TableCell>
                <TableCell>96,503.34</TableCell>
                <TableCell>191,939.21</TableCell>
                <TableCell>122,952.81</TableCell>
                <TableCell>-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="sticky left-[120px] bg-background">
                  B
                </TableCell>
                <TableCell>137,029.24</TableCell>
                <TableCell>152,965.54</TableCell>
                <TableCell>270,184.44</TableCell>
                <TableCell>237,422.86</TableCell>
                <TableCell>-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="sticky left-[120px] bg-background">
                  C
                </TableCell>
                <TableCell>-36,493.13</TableCell>
                <TableCell>60,660.13</TableCell>
                <TableCell>105,382.35</TableCell>
                <TableCell>76,832.01</TableCell>
                <TableCell>-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="sticky left-[120px] bg-background">
                  PB
                </TableCell>
                <TableCell>838,000</TableCell>
                <TableCell>938,000</TableCell>
                <TableCell>763,000</TableCell>
                <TableCell>1,028,000</TableCell>
                <TableCell>-</TableCell>
              </TableRow>

              {/* 6. Rebates */}
              <TableRow>
                <TableCell
                  className="font-medium sticky left-0 bg-background"
                  rowSpan={4}
                >
                  6. Rebates
                </TableCell>
                <TableCell className="sticky left-[120px] bg-background">
                  A
                </TableCell>
                <TableCell>9,126.69</TableCell>
                <TableCell>7,544.38</TableCell>
                <TableCell>8,114.13</TableCell>
                <TableCell>13,116.4</TableCell>
                <TableCell>-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="sticky left-[120px] bg-background">
                  B
                </TableCell>
                <TableCell>1,083.78</TableCell>
                <TableCell>818.7</TableCell>
                <TableCell>846.1</TableCell>
                <TableCell>886.58</TableCell>
                <TableCell>-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="sticky left-[120px] bg-background">
                  C
                </TableCell>
                <TableCell>6,500.69</TableCell>
                <TableCell>5,531.74</TableCell>
                <TableCell>5,247.78</TableCell>
                <TableCell>8,850.34</TableCell>
                <TableCell>-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="sticky left-[120px] bg-background">
                  O
                </TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
              </TableRow>

              {/* 7. Closing (After Rebates) */}
              <TableRow>
                <TableCell
                  className="font-medium sticky left-0 bg-background"
                  rowSpan={4}
                >
                  7. Closing (After Rebates)
                </TableCell>
                <TableCell className="sticky left-[120px] bg-background">
                  A
                </TableCell>
                <TableCell>33,039.41</TableCell>
                <TableCell>104,047.72</TableCell>
                <TableCell>200,053.34</TableCell>
                <TableCell>136,069.21</TableCell>
                <TableCell>-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="sticky left-[120px] bg-background">
                  B
                </TableCell>
                <TableCell>138,113.02</TableCell>
                <TableCell>153,784.24</TableCell>
                <TableCell>271,030.54</TableCell>
                <TableCell>238,309.44</TableCell>
                <TableCell>-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="sticky left-[120px] bg-background">
                  C
                </TableCell>
                <TableCell>-29,992.44</TableCell>
                <TableCell>66,191.87</TableCell>
                <TableCell>110,630.13</TableCell>
                <TableCell>85,682.35</TableCell>
                <TableCell>-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="sticky left-[120px] bg-background">
                  PB
                </TableCell>
                <TableCell>838,000</TableCell>
                <TableCell>938,000</TableCell>
                <TableCell>763,000</TableCell>
                <TableCell>1,028,000</TableCell>
                <TableCell>-</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
