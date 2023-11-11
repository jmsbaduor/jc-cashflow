$(document).ready(function() {
    // Data structure to store incomes, expenses, savings, and investments
    let data = {
        incomes: [],
        expenses: [],
        savings: [],
        investments: []
    };

    // Object to keep track of the currently editing item
    let editing = { type: null, id: null };

    // Load data from Local Storage
    function loadData() {
        let storedData = localStorage.getItem('athleteCashFlowData');
        if (storedData) {
            data = JSON.parse(storedData);
        }
        calculateTotals();
        renderAll();
    }

    // Save data to Local Storage and update the UI
    function saveData() {
        localStorage.setItem('athleteCashFlowData', JSON.stringify(data));
        calculateTotals();
        renderAll();
    }

    // Calculate and display totals for income, expenses, savings, and investable amount
    function calculateTotals() {
        let totalIncome = data.incomes.reduce((sum, item) => sum + item.amount, 0);
        let totalExpenses = data.expenses.reduce((sum, item) => sum + item.amount, 0);
        let totalSavings = data.savings.reduce((sum, item) => sum + item.amount, 0);

        $('#totalIncome').text(totalIncome.toFixed(2));
        $('#totalExpenses').text(totalExpenses.toFixed(2));
        $('#totalSavings').text(totalSavings.toFixed(2));

        let investableAmount = totalIncome - totalExpenses - totalSavings;
        $('#investableAmount').text(investableAmount.toFixed(2));

        updateInvestments(investableAmount);
    }

    // Update investments based on the new investable amount and calculate total yearly investment
    function updateInvestments(investableAmount) {
        let totalYearlyInvestment = 0;

        data.investments.forEach(investment => {
            investment.investAmount = (investableAmount * (investment.percentage / 100)).toFixed(2);
            totalYearlyInvestment += parseFloat(investment.investAmount);
        });

        totalYearlyInvestment *= 12; // Multiply by 12 to get yearly total
        $('#totalYearlyInvestment').text(totalYearlyInvestment.toFixed(2));

        renderList('investments');
    }

    // Render a list item for each type (incomes, expenses, savings, investments)
    function renderItem(type, item) {
        let content = `<li>${item.title}`;
        if (type === 'investments') {
            content += ` - ${item.percentage}% - Invest Amount: €${item.investAmount}`;
        } else {
            content += ` - €${item.amount.toFixed(2)}`;
        }
        content += ` <button class="edit-item" data-id="${item.id}">Edit</button>
                    <button class="remove-item" data-id="${item.id}">Remove</button></li>`;
        return content;
    }

    // Render the list for each data type
    function renderList(type) {
        let list = data[type].map(item => renderItem(type, item));
        $(`#${type}List`).html(list.join(''));
    }

    // Render all lists (incomes, expenses, savings, investments)
    function renderAll() {
        renderList('incomes');
        renderList('expenses');
        renderList('savings');
        renderList('investments');
    }

    // Show the form for adding or editing items
    function showForm(type, id = null) {
        let isEditing = id !== null;
        editing.type = type;
        editing.id = id;

        let item = isEditing ? data[type].find(i => i.id === id) : {};

        $('#formTitle').val(isEditing ? item.title : '');
        $('#formAmount').toggle(type !== 'investments').val(isEditing && type !== 'investments' ? item.amount : '');
        $('#formPercentage').toggle(type === 'investments').val(isEditing && type === 'investments' ? item.percentage : '');
        $('#formModal').show();
    }

    // Save an item (add or edit)
    function saveItem() {
        let item = {
            id: editing.id || Date.now(),
            title: $('#formTitle').val(),
            amount: editing.type !== 'investments' ? parseFloat($('#formAmount').val()) : undefined,
            percentage: editing.type === 'investments' ? parseFloat($('#formPercentage').val()) : undefined
        };

        if ((editing.type !== 'investments' && isNaN(item.amount)) ||
            (editing.type === 'investments' && isNaN(item.percentage))) {
            alert('Please enter valid values');
            return;
        }

        if (editing.id) {
            let index = data[editing.type].findIndex(i => i.id === editing.id);
            data[editing.type][index] = item;
        } else {
            data[editing.type].push(item);
        }

        $('#formModal').hide();
        saveData();
    }

    // Remove an item from the list
    function removeItem(type, id) {
        data[type] = data[type].filter(item => item.id !== id);
        saveData();
    }

    // Event handlers for adding, editing, and removing items
    $('#addIncome').click(() => showForm('incomes'));
    $('#addExpense').click(() => showForm('expenses'));
    $('#addSaving').click(() => showForm('savings'));
    $('#addInvestment').click(() => showForm('investments'));
    $('#saveForm').click(saveItem);
    $('#cancelForm').click(() => $('#formModal').hide());

    // Attach event handlers for edit and remove actions using event delegation
    $('ul').on('click', 'button.edit-item', function() {
        let type = $(this).closest('ul').attr('id').replace('List', '');
        let id = parseInt($(this).data('id'));
        showForm(type, id);
    });

    $('ul').on('click', 'button.remove-item', function() {
        let type = $(this).closest('ul').attr('id').replace('List', '');
        let id = parseInt($(this).data('id'));
        removeItem(type, id);
    });

    // Load initial data
    loadData();
});
