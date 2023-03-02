import React, { useMemo,useState, useEffect } from "react";
import clsx from "clsx";
import { useTable, useFlexLayout, useResizeColumns, useRowSelect, useSortBy  } from "react-table";
import Cell from "./Cell";
import Header from "./Header";
import PlusIcon from "./img/Plus";
import { useCellRangeSelection } from 'react-table-plugins'
import useScrollOnEdges from 'react-scroll-on-edges'

const defaultColumn = {
  minWidth: 50,
  width: 150,
  maxWidth: 400,
  Cell: Cell,
  Header: Header,
  sortType: "alphanumericFalsyLast"
};

export default function Table({ columns, data, dispatch: dataDispatch, skipReset }) {

  const [selectedRange, setSelectedRange] = useState({});

  const [selectedCells, setSelectedCells] = useState([]);
  const [copiedValue, setCopiedValue] = useState('');

    const handleCopy = (event, value) => {
    event.clipboardData.setData('text/plain', value);
    event.preventDefault();
    document.execCommand('copy');
  };
  const handlePaste = (event,row,cell) => {
    event.preventDefault();
    console.log("row,col,value",row,cell.column.id)
    const clipboardData = event.clipboardData.getData('text/plain');
    console.log("clipboardData",clipboardData);
    // const copiedValue =  event.clipboardData.setData('text/plain', value);
    // if (clipboardData !== copiedValue) {
       // handle paste logic here
       const text = event.clipboardData.getData('text/plain');
       const newData = [...data];
       console.log("newData",newData)
       newData[row][cell.column.id] = text.trim();
// }
    dataDispatch({type:"update_cell"})
  };



  // function handlePaste(e, row, col) {
  //   e.preventDefault();
  //   const text = e.clipboardData.getData('text/plain');
  //   const newData = [...data];
  //   newData[row][col] = text.trim();
  // }
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

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow, selectedFlatRows,
    state: { selectedCellIds, currentSelectedCellIds, isSelectingCells  },
     
    getCellsBetweenId,
    setSelectedCellIds,
    cellsById
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      dataDispatch,
      autoResetSortBy: !skipReset,
      autoResetFilters: !skipReset,
      autoResetRowState: !skipReset,
      sortTypes,
      cellIdSplitBy: '_',
      initialState: {
        selectedCellIds: {}
      }
    },
 
    useCellRangeSelection,
    useFlexLayout,
    useResizeColumns,
    useSortBy,
    useRowSelect, 
    // (hooks) => {
    //   hooks.visibleColumns.push((columns) => [
    //     {
    //       id: 'selection',
    //       label: "checkbox",
    //       Header: () => "Checkbox",
    //       width:"76",
    //       Cell: ({ row }) => (
    //         <div>
    //           <input type="checkbox" {...row.getToggleRowSelectedProps()}/>
    //         </div>
    //       ),
    //     },
    //     ...columns,
    //   ]);
    // }
  );

  useEffect(() => {
    if(Object.keys(selectedCellIds).length > 0) {
      const newData = [...data]
      const firstValue =Object.keys(selectedCellIds)[0].split('_');
      const newValueToReplace = newData[firstValue[1]][firstValue[0]];
      Object.keys(selectedCellIds).forEach((key, i) => {
        const keyName = key.split('_')[0] 
        const index = key.split('_')[1]
        if(i === 0 ||firstValue[0] != keyName ) return;
        
  
        newData[index][keyName] = newValueToReplace;
      })
      dataDispatch({ type: "update_cell" })
    }
  }, [selectedCellIds])

  let cellsSelected = { ...currentSelectedCellIds, ...selectedCellIds }

  // returns two random cell ids, this is just for the demo.
  const getRandomCellIds = React.useCallback(() => {
    let cloneCellIds = Object.keys(cellsById)
    let randomCellId = () =>
      cloneCellIds[(cloneCellIds.length * Math.random()) << 0]
    return [randomCellId(), randomCellId()]
  }, [cellsById])

  // getCellsBetweenId returns all cell Ids between two cell Id, and then setState for selectedCellIds
  const selectRandomCells = React.useCallback(() => {
    const cellsBetween = getCellsBetweenId(...getRandomCellIds())
    setSelectedCellIds(cellsBetween)
  }, [getCellsBetweenId, setSelectedCellIds, getRandomCellIds])

  const handleCellMouseDown = (rowIndex, columnIndex) => {
    setSelectedRange({
      startRow: rowIndex,
      endRow: rowIndex,
      startColumn: columnIndex,
      endColumn: columnIndex
    });
  };

  const handleCellMouseOver = (rowIndex, columnIndex) => {
    setSelectedRange(prevRange => {
      return {
        ...prevRange,
        endRow: rowIndex,
        endColumn: columnIndex
      };
    });
  };

  const selectedRowIds = useMemo(() => selectedFlatRows.map((row) =>{
    
    return (
      row
    )
  }
  ), [selectedFlatRows]);
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
  const getEdgeScrollingProps = useScrollOnEdges({
    canAnimate: isSelectingCells // Scroll when user `isSelectingCells` is True
    // scrollSpeed: 15, -> Optional, default is 12,
    // edgeSize: 30     -> Optional, default is 25
  })

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
          <div {...headerGroups[0].getHeaderGroupProps()} className='tr'>
            {headerGroups[0].headers.map((column) => {
              return (
                column.render("Header")
              )
            })}
          </div>

        </div>
        <div {...getTableBodyProps()}>
          {rows.map((row, rowIndex ) => {
            prepareRow(row);
            return (
              <div  key={rowIndex} {...row.getRowProps()} className= {'tr'+rowIndex}>
                {row.cells.map((cell,colIndex) => {
                  return (
                     
                    <div
                   
                    {...cell.getCellRangeSelectionProps()}
                    {...cell.getCellProps(
                      {
                        onCopy: event => handleCopy(event, cell.value),
                        onPaste : event => handlePaste(event, rowIndex, cell)
                    // onCopy: event => handleCopy(event, cell.value),
                    // onPaste : event => handlePaste(event, rowIndex, colIndex)  
                  }
                  )} 
                  
                  suppressContentEditableWarning={true}
                  contentEditable = {!cell.getCellProps().key?.includes("999999") }
                  style=
                  {
                    cellsSelected[cell.id]
                      ? { ...cell.getCellProps().style, backgroundColor: '#6beba8', userSelect: 'none' }
                      : {...cell.getCellProps().style ,  backgroundColor: 'white', userSelect: 'none' }
                  }
                  className='td'> 
                    {cell.render("Cell")}
                  </div>
                )})}
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
      <pre>
        <code>
        {JSON.stringify({ selectedCellIds, currentSelectedCellIds }, null, 2)}
        </code>
      </pre>
    </>
  );
}
