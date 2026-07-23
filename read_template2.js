const XlsxPopulate = require('xlsx-populate');

XlsxPopulate.fromFileAsync('public/template_laporan.xlsx')
    .then(workbook => {
        const sheet1 = workbook.sheet(0);
        console.log("Sheet 1 (Ringkasan):");
        console.log("A13:", sheet1.cell("A13").value());
        console.log("B13:", sheet1.cell("B13").value());
        console.log("C13:", sheet1.cell("C13").value());
        console.log("D13:", sheet1.cell("D13").value());
        console.log("E13:", sheet1.cell("E13").value());
        
        console.log("A14:", sheet1.cell("A14").value());
        console.log("B14:", sheet1.cell("B14").value());
        console.log("C14:", sheet1.cell("C14").value());
        console.log("D14:", sheet1.cell("D14").value());
        console.log("E14:", sheet1.cell("E14").value());
        
        const sheet2 = workbook.sheet(1);
        console.log("\nSheet 2 (Indikator):");
        console.log("A8:", sheet2.cell("A8").value());
        console.log("B8:", sheet2.cell("B8").value());
        console.log("C8:", sheet2.cell("C8").value());
        console.log("D8:", sheet2.cell("D8").value());
        console.log("E8:", sheet2.cell("E8").value());
        console.log("F8:", sheet2.cell("F8").value());
        
        console.log("A10:", sheet2.cell("A10").value());
        console.log("B10:", sheet2.cell("B10").value());
        console.log("C10:", sheet2.cell("C10").value());
        console.log("D10:", sheet2.cell("D10").value());
        console.log("E10:", sheet2.cell("E10").value());
        console.log("F10:", sheet2.cell("F10").value());
    });
