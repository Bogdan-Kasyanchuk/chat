import { ActionIcon, CloseButton, Popover, Text, Textarea } from '@mantine/core';
import { IconArrowBackUp, IconKeyboard, IconMoodSmile, IconPencil, IconSend } from '@tabler/icons-react';
import { type FC, type KeyboardEvent, useEffect, useLayoutEffect, useRef, useState } from 'react';

import EmojiPicker from '@/components/EmojiPicker';
import useIsDesktop from '@/hooks/useIsDesktop';
import { insertAtCursor } from '@/lib/emoji';
import type { MessageView } from '@/types/chat';
import { MAX_MESSAGE_LENGTH } from '@convex/chatRules';

import classes from './Composer.module.css';

export type ReplyDraft = {
    authorName: string,
    body: string
};

type ComposerProps = {
    disabled: boolean,
    replyTo: ReplyDraft | null,
    editing: Pick<MessageView, 'id' | 'body'> | null,
    onCancel: () => void,
    // Відхилений проміс повертає текст у поле
    onSubmit: (body: string) => Promise<void>
};

const Composer: FC<ComposerProps> = ({ disabled, replyTo, editing, onCancel, onSubmit }) => {
    const [ value, setValue ] = useState(editing?.body ?? '');
    const [ editingId, setEditingId ] = useState(editing?.id ?? null);
    // Чернетка, яку відклало редагування: повертається, коли воно закінчиться
    const [ draft, setDraft ] = useState('');
    const [ pickerOpen, setPickerOpen ] = useState(false);
    const fieldRef = useRef<HTMLTextAreaElement>(null);
    // Позиція курсору після вставки емодзі: ставимо, коли React уже оновив значення поля
    const caretRef = useRef<number | null>(null);
    const isDesktop = useIsDesktop();

    // Початок редагування відкладає чернетку й підставляє текст повідомлення, кінець — повертає чернетку
    if ((editing?.id ?? null) !== editingId) {
        setEditingId(editing?.id ?? null);

        if (editing) {
            setValue(editing.body);

            if (editingId === null) {
                setDraft(value);
            }
        } else {
            setValue(draft);
            setDraft('');
        }
    }

    useEffect(() => {
        if (replyTo || editing) {
            fieldRef.current?.focus();
        }
    }, [ replyTo, editing ]);

    useLayoutEffect(() => {
        const field = fieldRef.current;
        const caret = caretRef.current;

        if (field && caret !== null) {
            caretRef.current = null;
            field.setSelectionRange(caret, caret);

            // На телефоні панель замінює клавіатуру: поле не фокусуємо
            if (isDesktop) {
                field.focus();
            }
        }
    }, [ value, isDesktop ]);

    if (disabled) {
        return (
            <div className={ classes.composer }>
                <Text
                    className={ classes.notice }
                    c="dimmed"
                    size="sm"
                >
                    You can&apos;t message a deleted account
                </Text>
            </div>
        );
    }

    const submit = async () => {
        const body = value;

        if (!body.trim()) {
            return;
        }

        setValue('');

        try {
            await onSubmit(body);
        } catch {
            // Помилку вже показано; текст повертаємо, якщо людина не встигла почати нове
            setValue(current => current === '' ? body : current);
        }
    };

    const insertEmoji = (emoji: string) => {
        const field = fieldRef.current;
        const start = field?.selectionStart ?? value.length;
        const end = field?.selectionEnd ?? value.length;
        const result = insertAtCursor(value, start, end, emoji, MAX_MESSAGE_LENGTH);

        caretRef.current = result.caret;
        setValue(result.value);
    };

    const togglePhonePicker = () => {
        if (pickerOpen) {
            setPickerOpen(false);
            fieldRef.current?.focus();
        } else {
            fieldRef.current?.blur();
            setPickerOpen(true);
        }
    };

    const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault();
            void submit();
        }
    };

    const bar = editing
        ? { icon: <IconPencil size={ 18 } />, title: 'Edit message', text: editing.body, close: 'Cancel editing' }
        : replyTo && { icon: <IconArrowBackUp size={ 18 } />, title: `Reply to ${ replyTo.authorName }`, text: replyTo.body, close: 'Cancel reply' };

    return (
        <div
            className={ classes.composer }
            onKeyDown={ event => {
                if (event.key === 'Escape' && pickerOpen) {
                    setPickerOpen(false);
                }
            } }
        >
            { bar && (
                <div className={ classes.bar }>
                    { bar.icon }
                    <div className={ classes.barText }>
                        <Text
                            size="sm"
                            fw={ 600 }
                            truncate
                        >
                            { bar.title }
                        </Text>
                        <Text
                            size="sm"
                            c="dimmed"
                            truncate
                        >
                            { bar.text }
                        </Text>
                    </div>
                    <CloseButton
                        aria-label={ bar.close }
                        onClick={ onCancel }
                    />
                </div>
            ) }
            <div className={ classes.input }>
                { isDesktop
                    ? (
                        <Popover
                            opened={ pickerOpen }
                            position="top-start"
                            shadow="md"
                            withinPortal
                            onChange={ setPickerOpen }
                        >
                            <Popover.Target>
                                <ActionIcon
                                    aria-label="Emoji"
                                    aria-expanded={ pickerOpen }
                                    size="lg"
                                    variant="subtle"
                                    color="gray"
                                    onClick={ () => {
                                        setPickerOpen(open => !open);
                                    } }
                                >
                                    <IconMoodSmile size={ 20 } />
                                </ActionIcon>
                            </Popover.Target>
                            <Popover.Dropdown p={ 0 }>
                                <EmojiPicker onSelect={ insertEmoji } />
                            </Popover.Dropdown>
                        </Popover>
                    )
                    : (
                        <ActionIcon
                            aria-label={ pickerOpen ? 'Show keyboard' : 'Emoji' }
                            aria-expanded={ pickerOpen }
                            size="lg"
                            variant="subtle"
                            color="gray"
                            onClick={ togglePhonePicker }
                        >
                            { pickerOpen ? <IconKeyboard size={ 20 } /> : <IconMoodSmile size={ 20 } /> }
                        </ActionIcon>
                    ) }
                <Textarea
                    ref={ fieldRef }
                    className={ classes.field }
                    aria-label="Message"
                    placeholder="Write a message..."
                    value={ value }
                    maxLength={ MAX_MESSAGE_LENGTH }
                    maxRows={ 6 }
                    minRows={ 1 }
                    autosize
                    onChange={ event => {
                        setValue(event.currentTarget.value);
                    } }
                    onKeyDown={ onKeyDown }
                />
                <ActionIcon
                    aria-label="Send"
                    size="lg"
                    onClick={ () => {
                        void submit();
                    } }
                >
                    <IconSend size={ 18 } />
                </ActionIcon>
            </div>
            { pickerOpen && !isDesktop && (
                <div className={ classes.panel }>
                    <EmojiPicker onSelect={ insertEmoji } />
                </div>
            ) }
        </div>
    );
};

export default Composer;
