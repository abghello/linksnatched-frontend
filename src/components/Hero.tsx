'use client';

import React, { useEffect, useState } from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuthContext } from '@/auth/hooks/use-auth-context';
import { getLinks } from '@/actions/links';
import { ILink } from '@/types';
import { format } from 'date-fns';

const columns: ColumnDef<ILink>[] = [
  {
    accessorKey: 'resolvedTitle',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Resolved Title
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue('resolvedTitle')}</div>,
  },
  {
    accessorKey: 'givenTitle',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Given Title
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className='max-w-[200px] truncate'>{row.getValue('givenTitle')}</div>
    ),
  },
  {
    accessorKey: 'tags',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Tags
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className='max-w-[200px] truncate'>{row.getValue('tags')}</div>
    ),
  },
  {
    accessorKey: 'displayUrl',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Display URL
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className='max-w-[200px] truncate'>{row.getValue('displayUrl')}</div>
    ),
  },
  {
    accessorKey: 'topImageUrl',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Top Image Url
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className='max-w-[200px] truncate'>
        {row.getValue('topImageUrl')}
      </div>
    ),
  },
  {
    accessorKey: 'givenUrl',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Given Url
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className='max-w-[200px] truncate'>{row.getValue('givenUrl')}</div>
    ),
  },
  {
    accessorKey: 'resolvedUrl',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Resolved Url
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className='max-w-[200px] truncate'>
        {row.getValue('resolvedUrl')}
      </div>
    ),
  },
  {
    accessorKey: 'domain',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Domain
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className='max-w-[200px] truncate'>{row.getValue('domain')}</div>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Created At
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className='max-w-[200px] truncate'>
        {format(row.getValue('createdAt'), 'MM/dd/yyyy hh:mm a')}
      </div>
    ),
  },
];

export const Hero = () => {
  const [sorting, setSorting] = React.useState<SortingState>([
    {
      id: 'createdAt',
      desc: true,
    },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [links, setLinks] = useState<ILink[]>([]);
  const { user } = useAuthContext();

  const table = useReactTable({
    data: links,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  useEffect(() => {
    if (!user) return;
    const fetchLinks = async () => {
      const { data } = await getLinks(user.id);
      setLinks(data || []);
    };

    fetchLinks();
  }, [user]);

  return (
    <div className='mx-auto'>
      <div className='flex items-center py-4'>
        <Input
          placeholder='Filter resolved title...'
          value={
            (table.getColumn('resolvedTitle')?.getFilterValue() as string) ?? ''
          }
          onChange={(event) =>
            table.getColumn('resolvedTitle')?.setFilterValue(event.target.value)
          }
          className='max-w-sm'
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' className='ml-auto'>
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className='flex items-center justify-end space-x-2 py-4'>
        <div className='text-muted-foreground flex-1 text-sm'>
          {table.getFilteredRowModel().rows.length} row(s) found.
        </div>
        <div className='space-x-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};
