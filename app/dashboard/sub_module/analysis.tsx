import { TabsContent } from '@/components/ui/tabs'
import React, { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import useQuery from '@/hooks/use-query';
import { AnalysisBar } from './analysis-bar';

const Analysis = ({ dateRange, timeRange, handleSelectChange }: { dateRange: string, timeRange: string, handleSelectChange: (value: string, type: "date" | "time") => void }) => {
  const [tableData, setTableData] = useState([]);

  const tableDataQuery = useQuery(`/dashboard/get-table-analytic?date_type=${dateRange}`);

  useEffect(() => {
    if (tableDataQuery.data) {
      const sortedData = Object.values(tableDataQuery.data.data).sort((a: any, b: any) => b.total - a.total) as any;
      setTableData(sortedData);
    }
  }, [tableDataQuery.isFetching]);

  return (
    <TabsContent value="analysis" className="space-y-4">
      <div className="grid grid-cols-6 grid-rows-12 gap-4">
        <div className="col-span-4 row-span-12">
          <Table className='border  text-xs '>
            <TableHeader>
              <TableRow >
                <TableHead>Store ID</TableHead>
                <TableHead className="w-[200px]">Store Name</TableHead>
                <TableHead>Store Category</TableHead>
                <TableHead className='text-center'>Store Floor</TableHead>
                <TableHead className="text-right">Visit Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.values(tableData).map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>{item?.shop_information?.readable_id}</TableCell>
                  <TableCell >{item.name}</TableCell>
                  <TableCell>{item?.shop_information?.store_category.name}</TableCell>
                  <TableCell className='text-center'>{item?.floor}</TableCell>
                  <TableCell className="text-right">{item.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="col-span-2 row-span-6">
          <AnalysisBar />
        </div>
       
      </div>
    </TabsContent>
  )
}

export default Analysis