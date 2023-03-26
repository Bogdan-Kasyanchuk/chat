import { IconSearch } from '@tabler/icons-react';
import { FC } from 'react';

import { Box, TextInput } from '@mantine/core';
import { useInputState } from '@mantine/hooks';

import useFilter from '@/hooks/useFilter';

import useStyles from './ContactsBoard.styles';

const qwerty = [
  {
    name: 'petro',
    age: 25,
  },
  {
    name: 'roman',
    age: 30,
  },
  {
    name: 'igor',
    age: 35,
  },
];

const ContactsBoard: FC = () => {
  const [value, setValue] = useInputState('');
  const { filteredContacts } = useFilter(qwerty, value);
  const { classes } = useStyles();

  return (
    <Box w='35%' miw={360} className={classes.contactsBoard}>
      <Box bg='gray.1' p={20} className={classes.search}>
        <TextInput
          type='search'
          aria-label='Search chat'
          size='lg'
          placeholder='Search chat'
          iconWidth={40}
          icon={<IconSearch size={18} stroke={1.5} />}
          value={value}
          onChange={setValue}
        />
      </Box>
      <ul>
        {filteredContacts.map((el: any) => (
          <li key={el.name}>
            <p>{el.name}</p>
            <p>{el.age}</p>
          </li>
        ))}
      </ul>
    </Box>
  );
};

export default ContactsBoard;
