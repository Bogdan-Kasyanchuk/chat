import { ActionIcon, CloseButton, Popover, Text, Textarea } from '@mantine/core';
import { IconArrowBackUp, IconCheck, IconKeyboard, IconLock, IconMoodSmile, IconPencil, IconSend } from '@tabler/icons-react';
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
                <div className={ classes.notice }>
                    <IconLock
                        size={ 18 }
                        aria-hidden
                    />
                    You can’t message a deleted account
                </div>
            </div>
        );
    }

    const empty = value.trim() === '';

    const submit = async () => {
        const body = value;

        if (body.trim() === '') {
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

        // Відхилена вставка значення не змінює: застарілий курсор не ставимо
        if (result.value !== value) {
            caretRef.current = result.caret;
            setValue(result.value);
        }
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
        ? { icon: <IconPencil size={ 20 } />, title: 'Edit message', text: editing.body, close: 'Cancel editing' }
        : replyTo && { icon: <IconArrowBackUp size={ 20 } />, title: `Reply to ${ replyTo.authorName }`, text: replyTo.body, close: 'Cancel reply' };

    return (
        <div
            className={ classes.composer }
            onKeyDown={ event => {
                if (event.key === 'Escape' && pickerOpen) {
                    // Escape тут належить панелі: розмова (відповідь, вихід із чату) його не бачить
                    event.preventDefault();
                    event.stopPropagation();
                    setPickerOpen(false);
                }
            } }
        >
            <div className={ classes.row }>
                <div className={ classes.column }>
                    { bar && (
                        <div className={ classes.bar }>
                            <span className={ classes.barIcon }>{ bar.icon }</span>
                            <span className={ classes.barLine } />
                            <div className={ classes.barText }>
                                <Text
                                    className={ classes.barTitle }
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
                    <div
                        className={ classes.field }
                        data-with-bar={ bar ? true : undefined }
                    >
                        { isDesktop
                            ? (
                                <Popover
                                    opened={ pickerOpen }
                                    position="top-start"
                                    offset={ 12 }
                                    shadow="md"
                                    radius="lg"
                                    withinPortal
                                    onChange={ setPickerOpen }
                                >
                                    <Popover.Target>
                                        <ActionIcon
                                            className={ classes.emoji }
                                            aria-label="Emoji"
                                            aria-expanded={ pickerOpen }
                                            data-open={ pickerOpen || undefined }
                                            variant="subtle"
                                            color="gray"
                                            onClick={ () => {
                                                setPickerOpen(open => !open);
                                            } }
                                        >
                                            <IconMoodSmile size={ 22 } />
                                        </ActionIcon>
                                    </Popover.Target>
                                    <Popover.Dropdown
                                        className={ classes.popover }
                                        p={ 0 }
                                    >
                                        <EmojiPicker onSelect={ insertEmoji } />
                                    </Popover.Dropdown>
                                </Popover>
                            )
                            : (
                                <ActionIcon
                                    className={ classes.emoji }
                                    aria-label={ pickerOpen ? 'Show keyboard' : 'Emoji' }
                                    aria-expanded={ pickerOpen }
                                    data-open={ pickerOpen || undefined }
                                    variant="subtle"
                                    color="gray"
                                    onClick={ togglePhonePicker }
                                >
                                    { pickerOpen ? <IconKeyboard size={ 22 } /> : <IconMoodSmile size={ 22 } /> }
                                </ActionIcon>
                            ) }
                        <Textarea
                            ref={ fieldRef }
                            className={ classes.textarea }
                            classNames={ { input: classes.input } }
                            variant="unstyled"
                            aria-label="Message"
                            placeholder="Message"
                            value={ value }
                            maxLength={ MAX_MESSAGE_LENGTH }
                            maxRows={ 6 }
                            minRows={ 1 }
                            autosize
                            onChange={ event => {
                                setValue(event.currentTarget.value);
                            } }
                            onKeyDown={ onKeyDown }
                            onFocus={ () => {
                                // На телефоні клавіатура й панель разом не показуються
                                if (!isDesktop) {
                                    setPickerOpen(false);
                                }
                            } }
                        />
                    </div>
                </div>
                <ActionIcon
                    className={ classes.send }
                    aria-label={ editing ? 'Save changes' : 'Send' }
                    size={ 50 }
                    disabled={ empty }
                    onClick={ () => {
                        void submit();
                    } }
                >
                    { editing ? <IconCheck size={ 22 } /> : <IconSend size={ 22 } /> }
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
