import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import ShopCatalog from '../pages/Shop/ShopCatalog'

test('Filter by points', () => {
    const { getByText } = render(<ShopCatalog />);
    const checkbox = document.getElementById('affordableOnlyCheckbox') as HTMLInputElement;

    fireEvent.click(checkbox);

    const component = checkbox.parentNode as any;

    //console.log(component.state.items);
    // get component items state
});