import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function RecentSales() {
  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead className="text-right"># Rewards</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">Bank of America</TableCell>
            <TableCell className="text-right">7,098</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Regions</TableCell>
            <TableCell className="text-right">4,214</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">USAA</TableCell>
            <TableCell className="text-right">2,860</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Octapharma</TableCell>
            <TableCell className="text-right">352</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">MGM</TableCell>
            <TableCell className="text-right">88</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Jack Entertainment</TableCell>
            <TableCell className="text-right">34</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
