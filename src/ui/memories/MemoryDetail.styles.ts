import { Assets } from '@assets/Assets'
import { CommonStyles as C } from '@components/common/common.styles'
import { AppColors, AppFonts } from '@ui/styles/AppStyles'
import { appStyled } from '@ui/styles/AppThemes'
import { takeColor, takeFont } from '@util/recipies.util'
import { StyleSheet } from 'react-native'
import { Button } from 'react-native-elements'

const styles = StyleSheet.create({
  commentButtonStyle: {
    alignSelf: 'center',
    backgroundColor: AppColors.primaryLight,
    shadowColor: 'transparent',
    minHeight: 50,
  },
  commentButtonTitleStyle: {
    alignSelf: 'center',
    color: AppColors.primaryDark,
    fontFamily: AppFonts.NBold,
    fontSize: 16,
    marginLeft: 10,
  },
  commentButtonContainerStyle: {
    backgroundColor: AppColors.primaryLight,
    borderRadius: 12,
    borderColor: AppColors.lightMediumGray,
    borderWidth: 1,
  },
})

export const MemoryDetailStyles = {
  ChevronRightIcon: appStyled.Image.attrs({
    source: Assets.chevronRightIcon,
  })`
    tint-color: ${takeColor('darkGray')};
    margin-left: 10px;
    overflow: visible;
  `,
  ActionIcon: appStyled.Image.attrs({
    source: Assets.ellipsisVIcon,
  })`
    tint-color: ${takeColor('primaryDark')};
    margin: 10px 15px;
    overflow: visible;
  `,
  CommentIcon: appStyled.Image.attrs({
    source: Assets.commentIcon,
  })`
    tint-color: ${takeColor('primaryDark')};
    overflow: visible;
  `,
  Container: appStyled(C.Safe)`
    background-color: ${takeColor('primaryLight')};
  `,
  Padding: appStyled.View`
    padding-vertical: 5px;
    padding-horizontal: 20px;
    flex: 1;
  `,
  HeaderTitle: appStyled.View`
    justify-content: center;
    align-items: center;
  `,
  HeaderTitleText: appStyled.Text`
    font-family: ${takeFont('NSemiBold')};
    color: ${takeColor('primaryDark')};
    font-size: 16px;
  `,
  HeaderSubTitleText: appStyled.Text`
    font-family: ${takeFont('NSemiBold')};
    color: ${takeColor('darkGray')};
    font-size: 13px;
  `,
  Label: appStyled.Text`
    font-family: ${takeFont('NBold')};
    color: ${takeColor('neutralOnLight70')};
    font-size: 11px;
    text-transform: uppercase;
  `,
  PeopleContainer: appStyled.TouchableOpacity`
    flex-direction: row;
    align-items: center;
    padding: 10px 10px;
    border-radius: 13px;
    background-color: ${takeColor('inputBackground')};
    margin: 7px 0;
  `,
  PersonItem: appStyled.TouchableOpacity`
    padding: 5px 10px;
    justify-content: center;
    align-items: center;
    background-color: ${takeColor('primaryLight')};
    border-radius: 8px;
  `,
  PersonItemText: appStyled.Text`
    font-family: ${takeFont('NBold')};
    color: ${takeColor('neutralOnLight70')};
    font-size: 17px;
  `,
  PeopleChevronRight: appStyled.TouchableOpacity`
    justify-content: center;
    align-items: center;
  `,
  SegmentContainer: appStyled.View`
    flex: 1;
  `,
  CommentButton: appStyled(Button).attrs({
    title: 'View comments',
    buttonStyle: styles.commentButtonStyle,
    titleStyle: styles.commentButtonTitleStyle,
    containerStyle: styles.commentButtonContainerStyle,
  })`
  `,

  CommentButtonWrapper: appStyled.View`
  `,

  BadgeWrapper: appStyled.View`
    position: absolute;
    right: -10px;
    top: -5px;
    min-width: 20px;
    height: 20px;
    overflow: hidden;
    border-radius: 10px;
    border-width: 2px;
    border-color: ${takeColor('primaryLight')}
    background-color: ${takeColor('statesErrors')};
    align-items: center;
    justify-content: center;
    padding-horizontal: 3px;
  `,

  Badge: appStyled.Text`
    font-size: 13px;
    font-family: ${AppFonts.NBold};
    color: ${takeColor('primaryLight')}
    padding: 0;
    margin: 0;
  `,
}
