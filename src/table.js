import React, { useMemo,useState } from "react";
import clsx from "clsx";
import { useTable, useFlexLayout, useResizeColumns, useRowSelect, useSortBy } from "react-table";
import Cell from "./Cell";
import Header from "./Header";
import PlusIcon from "./img/Plus";

const defaultColumn = {
  minWidth: 50,
  width: 150,
  maxWidth: 400,
  Cell: Cell,
  Header: Header,
  sortType: "alphanumericFalsyLast"
};

export default function Table({ columns, data, dispatch: dataDispatch, skipReset }) {
  const [selectedCells, setSelectedCells] = useState([]);
  const [copiedValue, setCopiedValue] = useState('');
  const handleCopy = (event, value) => {
    event.clipboardData.setData('text/plain', value);
    event.preventDefault();
    document.execCommand('copy');
  };
  function handlePaste(e, row, col) {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    const newData = [...data];
    newData[row][col] = text.trim();
  }
  // const handlePaste = (event, cell) => {
  //   event.preventDefault();
  //   const clipboardData = event.clipboardData.getData('text/plain');
  //   if (clipboardData !== copiedValue) {
  //     cell.setCellProps({ style: { backgroundColor: 'red' } });
  //     // handle paste logic here
  //   }
  // };
  const handleCellSelection = (cell, event) => {
    const cellIndex = selectedCells.findIndex(selectedCell => selectedCell.id === cell.id);
    if (cellIndex >= 0) {
      setSelectedCells(prevSelectedCells =>
        prevSelectedCells.filter(selectedCell => selectedCell.id !== cell.id)
      );
    } else {
      setSelectedCells(prevSelectedCells => [...prevSelectedCells, cell]);
    }
  };

  const getCellProps = cell => {
    return {
      onClick: event => handleCellSelection(cell, event),
      style: {
        background: selectedCells.some(selectedCell => selectedCell.id === cell.id)
          ? '#dbdbdb'
          : 'transparent',
      },
    };
  };


  const sortTypes = useMemo(
    () => ({
      alphanumericFalsyLast(rowA, rowB, columnId, desc) {
        if (!rowA.values[columnId] && !rowB.values[columnId]) {
          return 0;
        }

        if (!rowA.values[columnId]) {
          return desc ? -1 : 1;
        }

        if (!rowB.values[columnId]) {
          return desc ? 1 : -1;
        }

        return isNaN(rowA.values[columnId])
          ? rowA.values[columnId].localeCompare(rowB.values[columnId])
          : rowA.values[columnId] - rowB.values[columnId];
      }
    }),
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow, selectedFlatRows } = useTable(
    {
      columns,
      data,
      defaultColumn,
      dataDispatch,
      autoResetSortBy: !skipReset,
      autoResetFilters: !skipReset,
      autoResetRowState: !skipReset,
      sortTypes,
    },
    useFlexLayout,
    useResizeColumns,
    useSortBy,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        {
          id: 'selection',
          label: "checkbox",
          Header: () => "Checkbox",
          width:"76",
          Cell: ({ row }) => (
            <div>
              <input type="checkbox" {...row.getToggleRowSelectedProps()} />
            </div>
          ),
        },
        ...columns,
      ]);
    }
  );

  const selectedRowIds = useMemo(() => selectedFlatRows.map((row) => row.original.id), [selectedFlatRows]);
  function isTableResizing() {
    for (let headerGroup of headerGroups) {
      for (let column of headerGroup.headers) {
        if (column.isResizing) {
          return true;
        }
      }
    }

    return false;
  }

  return (
    <>
      <pre>
        <code>
          {JSON.stringify(
            {
              selectedFlatRows: selectedFlatRows.map(row => row.original)
            },
            null,
            2
          )}
        </code>
      </pre>
      <div {...getTableProps()} className={clsx("table", isTableResizing() && "noselect")}>
        <div>
          {/* {headerGroups.map((headerGroup) => ( */}


          <div {...headerGroups[0].getHeaderGroupProps()} className='tr'>
            {/* {console.log("headerGroup",headerGroup)} */}
            {headerGroups[0].headers.map((column) => {
              return (
                column.render("Header")
              )
            })}
          </div>
          {/* ))} */}
        </div>
        <div {...getTableBodyProps()}>
          {rows.map((row, rowIndex ) => {
            prepareRow(row);
            return (
              <div {...row.getRowProps()} 
              
                className='tr'>
                {row.cells.map((cell,colIndex) => (                    
                    <div {...cell.getCellProps([getCellProps(cell)],{
                    onCopy: event => handleCopy(event, cell.value),
                    onPaste : event => handlePaste(event, rowIndex, colIndex)
                  })} 
                  contentEditable
                  className='td'>
                    {cell.render("Cell")}
                  </div>
                ))}
              </div>
            );
          })}
          <div className='tr add-row' onClick={() => dataDispatch({ type: "add_row" })}>
            <span className='svg-icon svg-gray' style={{ marginRight: 4 }}>
              <PlusIcon />
            </span>
            New
          </div>
        </div>
      </div>
    </>
  );
}
