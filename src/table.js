import MaterialTable from "material-table";
import React, { useState } from "react";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Dropdown from 'react-bootstrap/Dropdown';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export const Table = () => {

  const [open, setOpen] = React.useState(false);
  const [column,setColumn] = useState("")
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [tableData, setTableData] = useState([
    { Name: "Harsh", Email: "Harsh@gmail.com", City: "Indore", PhoneNumber: "9876543215" },
    { Name: "Chanchal", Email: "Chanchal@gmail.com", Age: "19", City: "Indore", PhoneNumber: "9856743215" },
    { Name: "Piyush", Email: "Piyush@gmail.com", Age: "18", City: "Indore", PhoneNumber: "9876543215" },
    { Name: "KUshal", Email: "KUshal@gmail.com", Age: "21", City: "Indore", PhoneNumber: "9876543215" },
    { Name: "Anshul", Email: "Anshul@gmail.com", Age: "23", City: "Indore", PhoneNumber: "9876543215" },
    { Name: "Arpit", Email: "Arpit@gmail.com", Age: "16", City: "Indore", PhoneNumber: "9876543215" },
    { Name: "Idris", Email: "Idris@gmail.com", Age: "17", City: "Indore", PhoneNumber: "9876543215" }
  ])
  const [columns, setcolumns] = useState([
    { title: "Name", field: "Name",filtering: false ,
    editCell: (props) => ({
      onCellEditApproved: (newValue, oldValue, rowData, columnDef) => {
        const dataUpdate = [...tableData];
        const index = rowData.tableData.id;
        dataUpdate[index][columnDef.field] = newValue;
        setTableData([...dataUpdate]);
      },
      onCellEditCancelled: (rowData, columnDef) => {},
    }),

  },
    { title: "Email", field: "Email", filtering: false,editable: true  },
    { title: "Age", field: "Age", emptyValue: () => <em>null</em>, filtering: false },
    { title: "City", field: "City", filtering: false },
    { title: "PhoneNumber", field: "PhoneNumber", filtering: false },
  ])


  const Submitt = async(e)=>{
    console.log("col")
    e.preventDefault();
    console.log(column)
    var addcol = columns
    addcol = [...addcol,{ title: column, field: column, filtering: false },]
    console.log(addcol);
    setcolumns(addcol)
  }
  return (
    <>
      <div>
        <Button onClick={handleOpen}>Add Column</Button>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <input type="text" value={column} onChange={(e) => setColumn(e.target.value)}/>
            <button onClick={Submitt}>Submit</button>
          </Box>
        </Modal>
        <MaterialTable title="dbDash"
          columns={columns}
          data={tableData}
          editingMode="modal" //default
          enableEditing
          editable={{
            onRowAdd: (newRow) => new Promise((resolve, reject) => {
              setTableData([...tableData, newRow])
              setTimeout(() => resolve(), 500)
            }),
            onRowUpdate: (newRow, oldRow) => new Promise((resolve, reject) => {
              const updateData = [...tableData]
              updateData[oldRow.tableData.id] = newRow
              setTableData(updateData)
              console.log(newRow, oldRow);
              setTimeout(() => resolve(), 500)
            }),
            onRowDelete: (selectedRow) => new Promise((resolve, reject) => {
              const updateData = [...tableData]
              updateData.splice(selectedRow.tableData.id, 1)
              setTableData(updateData);
              setTimeout(() => resolve(), 500)
            }),
          }}
          options={{ filtering: true, addRowPosition: "first", actionsColumnIndex: -1, selection: true,columnsButton: true,editable: true }}
        />

      </div>
    </>
  );
}